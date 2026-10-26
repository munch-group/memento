
## For next year / last part

- Notebooks from "Deep learning for visual recognition"
- AI exercises need to be fewer and harder and more "targeted.
- Drop Turtle next year.
- Put answers to exercises in "Read on..." collapsed callouts, so the student does not see the answers by acccient.

## TODO

- regex chapter
- Visualization exercise with geneinfo 

http://neuralnetworksanddeeplearning.com/chap1.html

http://ufldl.stanford.edu/tutorial/supervised/MultiLayerNeuralNetworks/#backpropagation_algorithm

Rename uv student folder to inst-mach for independent installation
put mon/wed slides on same pane and link pane swapping

https://playground.tensorflow.org. (the link holds state, so you can prepare links for different exercises)

-make a blast programming project.

- Make it a project that takes them through all the classes of the NCB blast system in bio Python.
Make a lecture that goes through how back
 propagation is used in neuro networks

Make an affinity design a file for figures for the lecture notes.
Make figures for a neuron network chapter.


- Rewrite AI chapters:
  - ai/practical-ai-use.ipynb
  - ai/ask-for-another-way.ipynb
  - ai/let-it-draft.ipynb
  - ai/reading-and-judging.ipynb
  - ai/tests-are-the-contract.ipynb
  - ai/documentation-and-resources.ipynb
  - ai/the-docs-are-the-test.ipynb
  - ai/plan-before-you-prompt.ipynb
  - ai/directing-a-resource.ipynb
  - ai/delegate-the-full-problem.ipynb
  - ai/learning-with-an-ai.ipynb
  - ai/surviving-ai.ipynb
  - ai/the-ai-off-test.ipynb
- Rewrite python chapters:
  - python/classes.ipynb
  - python/debugging.qmd
  - turtle/turtle-classes-debugging.ipynb
  - turtle/turtle-limits-to-visual-checks.ipynb
  - python/packages-modules.ipynb
   - new/biopython.ipynb
  - python/recursion.ipynb
  - python/decomposition.qmd
  - python/dataframes.ipynb
- Change projects to fit testing arc:
  - projects/codonbias-project.qmd
  - projects/hiv-project.qmd
  - projects/assembly-project.qmd
  - projects/orf-project.qmd




- Move modules "code in other files" to week 8 so we can start using BioPython 
- Introduce pandas/plotting and broadcasting (lin alg.)
- Finish chapters two weeks ahead
- Projects:
  - Add currationproject to weekplan
  - Finish testing arc and test projects. 
  - All existing projects should use my test suites, but with some of them having students do a few them selves. 
  - The project where they decompose and hand bodies to AI could be a project extending the orffinding project.
  - The project where they hand everything to AI could be one where they use Biopython / Rest APIs to blast etc. to shortlist found orfs
- TA comments on
  - https://munch-group.org/instructing-machines/ai/practical-ai-use.html
  - https://munch-group.org/instructing-machines/ai/ask-for-another-way.html
  - https://munch-group.org/instructing-machines/python/composition.html
  - https://munch-group.org/instructing-machines/turtle/turtle-functions.html
  - https://munch-group.org/instructing-machines/ai/let-it-draft.html
  - https://munch-group.org/instructing-machines/python/debugging.html
  - https://munch-group.org/instructing-machines/turtle/turtle-classes-debugging.html

## Exam

- At exam, they should also solve problems where they fix broken functions to make them work...

## Improvements

- UV setup (see below)
- Add execution fix for windows to "pixi run update" ((Set-ExecutionPolicy RemoteSigned -Scope CurrentUser  or  Set-ExecutionPolicy -ExecutionPolicy Unrestricted))
- Add " <br>—" to the end of each exercise to mark where it ends.
- Screencast with setup walk-through
- Make sure the "prompt" > is gone everywhere
- All paragraphs in separate cells
- Reminder exercises with crossrefs to other sections
- More exercises with less hints (coding practise) in the early weeks before projects.
- Stay in terminal for long er and go back and forth rather than use only notebooks after hello world.
- Make a set of Turtle exercises asking the students to produce code that draws a shown path/figure. Could be source of the extra exercises needed.
- Find a more robust way for kernels
- Prompting: practice exhaustive specification rather than providing it
- Ensure an early experience that AI does produce what they want, that there are prompts they are not able to express, it produces results they cannot validate.
- Add exercises for *recalling*: "Write some code that uses all the building blocks you know so far". "List all the rules you know so far. Both specific and general". "List the general rules you know (E.g. the meaning of a colon)".
- Oracle promping to identify specification
- Turtle obstacle competition and gladiator tournament
- In pixi install commamnd, maybe change `sh` to $SHELL or $(dscl . -read ~ UserShell | sed 's/UserShell: //')
  
## TAs

Sander Kudahl Larsen <skl@bce.au.dk>; Anna Bredgaard Bucka-Lassen <202507866@post.au.dk>; Rikke Redanz Mammen <202505478@post.au.dk>; Sarah Marie Østergaard <202504883@post.au.dk>; Louise Jensen <202505428@post.au.dk>; Marcus Nørsøller Mørch Andersen <marcus.andersen@au.dk>; Lærke Caroline Kristensen <202508912@post.au.dk>; Selma Tobberup Skipper <202506978@post.au.dk>; Ida Vandborg Jensen <202507629@post.au.dk>; Theodor Ortmann Hall <202505835@post.au.dk>

Add "execution policy fix" to "pixi run update": `set-executionpolicy -Scope CurentUser remotesigned`


## Testing 

Use `%%test` for notebook exercises like below, where they are asked to fill in body, tests or both.

```
%%test

from pytest import approx
from im_pytest import requires

@requires("find_start_positions")
def test_find_start_positions(module):
    ...


def find_start_positions(seq):
    ...

```

Make some oracle exercises where they should make a function that does the same.

```
import sys ; sys.path.append('./oracle') ; import oracle
oracle.enigma_function('ATGTAA')
```

Use oracle as help when doing projects:

```
import sys ; sys.path.append('./oracle') ; import oracle
oracle.split_codons('ATGTAA')
```



## UV setup

- Basically just use `uv` as dropin replacement for `pixi` and drop the `im-pixi-vscode` extension. That way everything becomes "native" vscode and the student can safely follow the instructions for any extension recommendations and missing dependencies.
- Update `im-course-tool` and `.pin_shell_path.sh` to use `uv` instead of `pixi`:
  - `pixi install` -> `uv sync`
  - `pixi shell` ->  Not needed if they *only* use the VScode terminal.
- In `vscode/extensions.json`, `"recommendations": ["munch-group.im-pixi-vscode"],` must be removed.
- New `vscode/settings.json`:

  ```
  {
      "chat.disableAIFeatures": true,
      "files.exclude": {
          "**/.pin_pixi_path.py": true,
          "**/.pin_shell_path.py": true,
          "**/.check_env.py": true,
          "**/.check_vscode.py": true,
          "**/__pycache__": true,
          "**/.pytest_cache": true
      },
      "editor.inlineSuggest.edits.allowCodeShifting": "never",
      "editor.inlineSuggest.edits.renderSideBySide": "never",
      "editor.acceptSuggestionOnEnter": "off",
      "editor.snippetSuggestions": "none",
      "workbench.welcomePage.walkthroughs.openOnInstall": false,
  }
  ```

- Install Mac:

  ```
  curl -LsSf https://astral.sh/uv/install.sh | sh

  # maybe to make sure:
  # Add to Zsh (macOS default)
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
  # Add to Bash
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bash_profile
  ```

- Install Windows:

  ```
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```

- Generate env:

  ```
  uv sync

  # force reinstall and do not rely on cached deps info
  uv sync --reinstall --refresh




  # if folder is moved:
  rm -rf .venv ; uv sync
  ```

To switch from pixi to uv:

- Add `.python-version`, `.env`, and `pyproject.toml`
- Remove `pixi.toml` and `pixi.lock`
- Make CI use `uv.lock` instead of `pixi.lock`
- Change `vscode/extensions.json` and `vscode/settings.json`
- Install `uv` and pin paths
- Make students use `im update` and `im get` in stead of the the `pixi run` versions.
- Make `im update` remove all pixi and the `im-course-tools extension`.

