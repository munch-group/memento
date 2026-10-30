
## TODO
- **Mandatory assignment**
- Check orf/hiv/assembly projects work with data files, and consider having students add tests
- Finish chapters:
  - neural_networks/digit-recognition.ipynb
   - neural_networks/language-models.ipynb
  - python/biopython.ipynb
  - bioinf/BLAST.qmd
  - ai/plan-before-you-prompt.ipynb
  - python/numpy-and-pandas.ipynb
  - python/plotting.ipynb
  - ai/delegate-the-full-problem.ipynb (merge with tests-are-the-contract that is pasted in at the top)
  - python/regular-expressions.ipynb
  - python/recursion.ipynb
- Projects:
  - Finish testing arc (see Testing below)
  - Write gene finding finale project
  - Write fully delegated project
- TA comments on
  - https://munch-group.org/instructing-machines/ai/practical-ai-use.html
  - https://munch-group.org/instructing-machines/ai/ask-for-another-way.html
  - https://munch-group.org/instructing-machines/python/composition.html
  - https://munch-group.org/instructing-machines/turtle/turtle-functions.html
  - https://munch-group.org/instructing-machines/ai/let-it-draft.html
  - https://munch-group.org/instructing-machines/python/debugging.html
  - https://munch-group.org/instructing-machines/turtle/turtle-classes-debugging.html
- Add "execution policy fix" to "pixi run update": `set-executionpolicy -Scope CurentUser remotesigned`
- Visualization exercise with geneinfo 

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

## For next year / last part

- Notebooks from "Deep learning for visual recognition"
- Read these [online notes](http://ufldl.stanford.edu/tutorial/supervised/MultiLayerNeuralNetworks/#backpropagation_algorithm) and improve neural network material.
- AI exercises need to be fewer and harder and more "targeted.
- Drop Turtle next year.
- Put answers to exercises in "Read on..." collapsed callouts, so the student does not see the answers by acccient.
- UV setup (see instructing-machines/pixi-to-uv-migration-plan.md)
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
- Use the [Neural Network Playground](https://playground.tensorflow.org) for some exercises (the page URL holds dashboard state, so you can prepare links for different exercises)
- Use the hidden "oracle" versions of project functions as a help to produce example output without showing the function. `pixi run build-oracles` already builds the obfuscated `*_solution.py` files. The student could do `import sys ; sys.path.append('./oracle') ; import oracle` and then oracle.split_codons('ATGTAA'). You can build obfuscated files for "oracle" exercises the same way so the students could be asked make a function that does the same as the hidden oracle function, which they would then probe like: `oracle.enigma_function('ATGTAA')`.

## Exam

- At exam, they should also solve problems where they fix broken functions to make them work...

## TAs

Sander Kudahl Larsen <skl@bce.au.dk>; Anna Bredgaard Bucka-Lassen <202507866@post.au.dk>; Rikke Redanz Mammen <202505478@post.au.dk>; Sarah Marie Østergaard <202504883@post.au.dk>; Louise Jensen <202505428@post.au.dk>; Marcus Nørsøller Mørch Andersen <marcus.andersen@au.dk>; Lærke Caroline Kristensen <202508912@post.au.dk>; Selma Tobberup Skipper <202506978@post.au.dk>; Ida Vandborg Jensen <202507629@post.au.dk>; Theodor Ortmann Hall <202505835@post.au.dk>


