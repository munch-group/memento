- Turn on hypothesis in Thesis html
- The PDF if what is handed in
- More detail on SVGD
- Man ikke regne med der bliver kigget i notebooks. 
  - Thesis skal stå alene. F.eks. under "To-ø modellen: identifiability og asymmetrisk migration": NB03 tester to-ø modellen systematisk.... (der skal stå i teksten hvordan...)
  - For at validere to-ø modellen blev den sammenlignet med msprime-simuleringer genereret under kendte parameterværdier. Da de sande parametre er kendte i dette scenarie, giver sammenligningen mulighed for direkte at vurdere, hvor godt den analytiske fase-type model beskriver den underliggende TMRCA-fordeling. ...
  - "Joint probability-validering mod msprime" Joint probability-modellen valideres ved inferens på joint SFS-data simuleret med kendte parameterværdier. Resultaterne er vist i Figure 24. Deficit er under, hvilket betyder, at den beregnede sandsynlighedstabel dækker langt størestedelen af de mulige observationer.
- Hvorfor bliver SVGD trace "hakket"
- Kalibrering af SVGD-inferens: nævn default moments-based prior
- ; efter figs for at undgaa <Figure size 900x400 with 0 Axes>
- Most of "Methods" experiments belong in a results-like chapter
- Lidt mere klart hvor mange samples fra hvilke populationer. (samme pop i two-island (ghost?))
- Husk at lade SVGD konvergere
- Island models: Baboons have different Ne and migration is not symmetric


----


- Better/clearer separation between introduction reiterating my work and her own contribution. Up to "To ø model..." it is mostly introduction.
- Make the introduction serve the results rather than being a review of Phasic's features. Introduce the relevant ones with an explicit purpose.
- More detail on SVGD theory and Bayesian statistics
- Distinguishing power and identifiability.
- E.g. in "Joint probability-inferens": she describes how to use phasic rather than than the math/alg and complexity involved.
- Results:
  - Effect of prior and other SVGD practicals: iterations, particles, optimizer etc.
  - She should address pitfalls of SVGD such as variance collapse.
  - Considers lower posterior std "good". The "correct" std is good.

- **NB**: Generelt farligt at simulere fra modelen og antage at den giver mening fordi men kan genfinde parametrene...!!

- In notebook 2 there is a mistake not modeling epoch transition time at all... (not even as fixed)

| # Ghost population: Tre-population model, men jeg sampler kun fra pop1 og pop2.
| # Pop3 er ghost (ingen samples). Linjer kan migrere til/fra ghost.

NB: mere omhyggelig med dansk sprog (rigtigt dansk, ikke "fordanskning"). E.g. "identifikation" vs Identifiability / "Koalescent" vs Coalescent / "konfundering" vs. confounding. "Prior, gevinst og sensitivitet"