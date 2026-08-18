## The short version

Don't use `rf.feature_importances_` — that's mean impurity decrease, computed on training data, and it's biased toward continuous/high-cardinality features. Use `sklearn.inspection.permutation_importance` on **held-out** data instead: it measures how much your classification metric drops when one statistic's link to the labels is destroyed by shuffling it.

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import StratifiedKFold, cross_val_score
import numpy as np, pandas as pd

def new_forest():
    return RandomForestClassifier(n_estimators=500, min_samples_leaf=2,
                                  class_weight="balanced", n_jobs=-1, random_state=0)

# 1. First: does the forest classify at all? If not, importances mean nothing.
cv = StratifiedKFold(5, shuffle=True, random_state=0)
auc = cross_val_score(new_forest(), X, y, cv=cv, scoring="roc_auc")

# 2. Permutation importance on each held-out fold, averaged
folds = []
for train, test in cv.split(X, y):
    m = new_forest().fit(X.iloc[train], y[train])
    r = permutation_importance(m, X.iloc[test], y[test], scoring="roc_auc",
                               n_repeats=20, random_state=0, n_jobs=-1)
    folds.append(r.importances_mean)
imp = pd.DataFrame({"importance": np.mean(folds, 0), "sd": np.std(folds, 0)},
                   index=X.columns).sort_values("importance", ascending=False)
```

The units are interpretable: "shuffling `xor_a` costs 0.13 AUC."

## Four things that will bite you

**Step 1 is not optional.** Permutation importance ranks features by their contribution to *this* model's predictions. If cross-validated AUC is ~0.5, the ranking is noise with a plausible-looking ordering. Report the AUC alongside the importances, always.

**Impurity importance really does mislead.** In my test data with a known ground truth, `feature_importances_` gave pure Gaussian noise a score of 0.109 — essentially tied with a genuinely informative feature at 0.127 — purely because continuous noise offers many split points. Permutation importance put that same noise feature at ~0.005.

**Correlated statistics split their credit,** which is the biggest trap for your use case, since summary statistics computed on the same items are usually correlated. Two features with r≈0.95 scored 0.048 and 0.028 separately — each looking marginal — because the forest can always fall back on the twin when one is shuffled. Shuffled *together* as a block, they scored 0.171, the largest effect in the data. So cluster on |Spearman ρ| and permute each cluster jointly:

```python
rho = np.asarray(spearmanr(X).statistic, dtype=float)
dist = 1.0 - np.abs(rho); np.fill_diagonal(dist, 0.0)
link = hierarchy.ward(squareform((dist + dist.T) / 2, checks=False))
labels = hierarchy.fcluster(link, t=0.3, criterion="distance")  # merges |rho| >= 0.7
```
then shuffle every column in a cluster with one shared row order (preserves within-block structure, breaks only the block↔label link). Report importance per block, not per feature, wherever a block has more than one member.

**An importance of 0.03 is not evidence of anything** until you know what chance looks like. Shuffle `y`, rerun the whole fit-and-score procedure, and compare — with identical `n_repeats`/`n_splits` for observed and null, or the variances differ and the comparison is invalid. In my run the 95th percentile of the null reached 0.035 for some features, above several "positive-looking" observed values.

## Two additions worth making

`mutual_info_classif(X, y)` gives a model-free univariate answer in nats — closest to literally "how much information". But it's univariate: on my interacting pair it scored 0.026/0.037 while the forest found 0.12/0.13 each, because neither feature carries marginal signal and only their combination separates the groups. That gap between the two methods is itself informative — it tells you a statistic matters only in combination with another.

For *direction* rather than magnitude, add `shap.TreeExplainer` or `sklearn.inspection.PartialDependenceDisplay`. Permutation importance tells you a statistic matters, never which group it points to.

[rf_feature_information.py](/private/tmp/claude-501/-Users-kmt-Fable/6d58b4b4-1b16-481d-a549-9d7dbb14100f/scratchpad/rf_feature_information.py) has all five steps as runnable functions, plus simulated data whose right answer is known so you can sanity-check the pipeline before pointing it at your own. Swap in your `X` (DataFrame, named columns) and `y`.

One caveat on runtime: the label-permutation null in step 4 is the expensive part — it refits the forest `n_perm × n_splits` times. At the demo settings (40 permutations, 3 folds) the whole script takes ~3.5 minutes. For a publication number you'd want `n_perm=1000`, which is an overnight job but trivially parallel.

```
"""How much does each statistic contribute to separating two groups?

Random-forest recipe: cross-validated permutation importance, with correlated
features handled by clustering and significance from a label-permutation null.

Toy data is constructed so the known answer is:
  signal_strong / signal_strong_copy : informative, mutually redundant (r ~ 0.95)
  signal_weak                        : weakly informative
  xor_a, xor_b                       : informative only jointly (no marginal signal)
  noise_gauss, noise_coarse, noise_binary : pure noise
"""

import numpy as np
import pandas as pd
from scipy.cluster import hierarchy
from scipy.spatial.distance import squareform
from scipy.stats import spearmanr
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import mutual_info_classif
from sklearn.inspection import permutation_importance
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import StratifiedKFold, cross_val_score

RNG = np.random.default_rng(0)
N = 400
SCORING = "roc_auc"


def make_data():
    y = np.repeat([0, 1], N // 2)
    strong = 0.9 * y + RNG.normal(size=N)
    a = RNG.normal(size=N)
    # sign(a * b) carries the label 85% of the time; neither a nor b alone does
    want = np.where(y == 1, 1.0, -1.0) * np.where(RNG.random(N) < 0.85, 1.0, -1.0)
    b = np.abs(RNG.normal(size=N)) * want * np.sign(a)
    X = pd.DataFrame(
        {
            "signal_strong": strong,
            "signal_strong_copy": strong + 0.3 * RNG.normal(size=N),
            "signal_weak": 0.35 * y + RNG.normal(size=N),
            "xor_a": a,
            "xor_b": b,
            "noise_gauss": RNG.normal(size=N),
            "noise_coarse": RNG.integers(0, 3, size=N).astype(float),
            "noise_binary": RNG.integers(0, 2, size=N).astype(float),
        }
    )
    return X, y


def new_forest():
    return RandomForestClassifier(
        n_estimators=500,
        min_samples_leaf=2,        # mild regularisation; tune for your n
        max_features="sqrt",
        class_weight="balanced",   # harmless when balanced, essential when not
        n_jobs=-1,
        random_state=0,
    )


# --- step 1: does the forest classify at all? -------------------------------
def model_skill(X, y, n_splits=5):
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=0)
    return cross_val_score(new_forest(), X, y, cv=cv, scoring=SCORING)


# --- step 2: cross-validated permutation importance ------------------------
def cv_permutation_importance(X, y, n_repeats=20, n_splits=5, seed=0):
    """Mean drop in test-set AUC when each column is shuffled, averaged over folds."""
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=seed)
    per_fold = []
    for train, test in cv.split(X, y):
        model = new_forest().fit(X.iloc[train], y[train])
        r = permutation_importance(
            model, X.iloc[test], y[test],
            scoring=SCORING, n_repeats=n_repeats, random_state=seed, n_jobs=-1,
        )
        per_fold.append(r.importances_mean)
    per_fold = np.vstack(per_fold)
    return pd.DataFrame(
        {"importance": per_fold.mean(axis=0), "sd_across_folds": per_fold.std(axis=0)},
        index=X.columns,
    ).sort_values("importance", ascending=False)


# --- step 3: correlated features permuted as blocks -----------------------
def correlation_clusters(X, threshold=0.7):
    rho = np.asarray(spearmanr(X).statistic, dtype=float)
    if rho.ndim == 0:  # spearmanr returns a scalar for exactly two columns
        rho = np.array([[1.0, float(rho)], [float(rho), 1.0]])
    rho = np.nan_to_num(rho, nan=0.0)
    dist = 1.0 - np.abs(rho)
    np.fill_diagonal(dist, 0.0)
    dist = (dist + dist.T) / 2.0
    link = hierarchy.ward(squareform(dist, checks=False))
    labels = hierarchy.fcluster(link, t=1.0 - threshold, criterion="distance")
    clusters = {}
    for col, lab in zip(X.columns, labels):
        clusters.setdefault(lab, []).append(col)
    return {"+".join(cols): cols for cols in clusters.values()}


def grouped_permutation_importance(X, y, groups, n_repeats=20, n_splits=5, seed=0):
    """Shuffle whole blocks of correlated columns together (one shared row order),
    so redundant copies cannot stand in for each other."""
    rng = np.random.default_rng(seed)
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=seed)
    per_fold = {name: [] for name in groups}
    for train, test in cv.split(X, y):
        model = new_forest().fit(X.iloc[train], y[train])
        Xte, yte = X.iloc[test], y[test]
        base = roc_auc_score(yte, model.predict_proba(Xte)[:, 1])
        for name, cols in groups.items():
            drops = []
            for _ in range(n_repeats):
                Xp = Xte.copy()
                order = rng.permutation(len(Xp))
                Xp[cols] = Xp[cols].to_numpy()[order]
                drops.append(base - roc_auc_score(yte, model.predict_proba(Xp)[:, 1]))
            per_fold[name].append(np.mean(drops))
    return (
        pd.Series({k: np.mean(v) for k, v in per_fold.items()}, name="importance")
        .sort_values(ascending=False)
        .to_frame()
    )


# --- step 4: is an importance bigger than chance? --------------------------
def permutation_pvalues(X, y, n_perm=40, n_repeats=5, n_splits=3, seed=0):
    """Null = repeat the entire fit+importance procedure with labels shuffled.

    The observed importance is recomputed here with exactly the same n_repeats /
    n_splits as the null, otherwise observed and null differ in variance and the
    comparison is not valid. Raise n_perm (and these settings) for real work;
    the smallest attainable p-value is 1 / (1 + n_perm).
    """
    obs = cv_permutation_importance(X, y, n_repeats=n_repeats, n_splits=n_splits,
                                    seed=seed)["importance"]
    rng = np.random.default_rng(seed)
    null = []
    for i in range(n_perm):
        y_shuf = rng.permutation(y)
        null.append(cv_permutation_importance(X, y_shuf, n_repeats=n_repeats,
                                              n_splits=n_splits, seed=i)["importance"])
    null = pd.concat(null, axis=1).T[obs.index]
    p = (1 + (null.to_numpy() >= obs.to_numpy()).sum(axis=0)) / (1 + n_perm)
    return pd.DataFrame(
        {"importance": obs, "null_95pct": null.quantile(0.95).values, "p": p},
        index=obs.index,
    )


if __name__ == "__main__":
    pd.set_option("display.float_format", lambda v: f"{v: .4f}")
    X, y = make_data()

    auc = model_skill(X, y)
    print(f"\n[1] cross-validated AUC: {auc.mean():.3f} +/- {auc.std():.3f}  {auc.round(3)}")
    if auc.mean() - auc.std() < 0.55:
        print("    -> too close to chance; importances below would not be interpretable")

    print("\n[2] permutation importance (drop in held-out AUC):")
    perm = cv_permutation_importance(X, y)
    print(perm)

    print("\n[2b] impurity importance (feature_importances_) -- for contrast only:")
    mdi = new_forest().fit(X, y).feature_importances_
    print(pd.Series(mdi, index=X.columns, name="MDI").sort_values(ascending=False))

    groups = correlation_clusters(X, threshold=0.7)
    print("\n[3] correlation clusters (|Spearman rho| >= 0.7 merged):")
    for name in groups:
        print("   ", name)
    print(grouped_permutation_importance(X, y, groups))

    print("\n[4] label-permutation null (n_perm=40, coarse settings for both):")
    print(permutation_pvalues(X, y, n_perm=40))

    print("\n[5] univariate mutual information (model-free, nats) -- misses interactions:")
    mi = mutual_info_classif(X, y, random_state=0)
    print(pd.Series(mi, index=X.columns, name="MI").sort_values(ascending=False))
```