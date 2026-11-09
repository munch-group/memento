
## TODO
- **Mandatory assignment**
- Check orf/hiv/assembly projects work with data files, and consider having students add tests
- Talk about exam next time
- Tell the students that their student folder may not be backed up (they should copy it to a backed up location)
- Finish chapters:
  - blast
  - molecular-evolution
  - recursion
  - plasmid-project
  - regular expressions
  - LLMs
 - Lectures: 
  - NN training
  - LLMs https://poloclub.github.io/transformer-explainer/
  - Dangers of AI
- Projects:
  - Finish gene finding finale project `claude --remote-control --resume 3d3298d9-f1ca-43da-9aee-82ed6b73571d`
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

## Grammarly

- [ ] notes_slides_recordings.qmd
- [ ] index.qmd
- [ ] slides/flashcards.qmd
- [ ] python/course-tools.ipynb
- [ ] intro/course-introduction.qmd 
- [x] ai/insides.ipynb
- [ ] python/terminal.qmd
- [ ] python/getting_set_up.qmd
- [ ] python/hello-world.qmd
- [ ] ai/meet-ai.ipynb
- [ ] ai/instruction.ipynb
- [ ] intro/notebooks.ipynb        
- [ ] python/values-operators-logic.ipynb
- [ ] python/variables.ipynb
- [ ] python/precedence-steps.ipynb
- [ ] python/control-flow.ipynb
- [ ] python/functions.ipynb 
- [ ] python/list-comprehensions.ipynb 
- [ ] ai/predict-then-prove.ipynb
- [ ] python/objects.ipynb
- [ ] ai/how-models-produce-code.ipynb
- [ ] python/lists.ipynb
- [ ] python/dictionaries.ipynb
- [ ] python/tuples.ipynb
- [ ] turtle/turtle-the-object.ipynb 
- [ ] ai/explain-then-confirm.ipynb
- [ ] python/iteration.ipynb
- [ ] python/testing.ipynb 
- [ ] turtle/turtle-loops-and-tests.ipynb 
- [ ] ai/practical-ai-use.ipynb
- [ ] python/data_structures.ipynb
- [ ] python/files.ipynb
- [ ] turtle/turtle-drawing-from-data.ipynb 
- [ ] python/testing_programming_projects.qmd
- [ ] projects/translation-project.qmd 
- [ ] ai/ask-for-another-way.ipynb 
- [ ] python/composition.qmd
- [ ] turtle/turtle-functions.ipynb 
- [ ] projects/folding-project.qmd 
- [ ] python/classes.ipynb
- [ ] ai/let-it-draft.ipynb 
- [ ] python/debugging.ipynb
- [ ] turtle/turtle-classes-debugging.ipynb 
- [ ] projects/codonbias-project.qmd 
- [ ] python/modules-and-packages.ipynb
- [x] neural_networks/neurons.qmd
- [x] neural_networks/neural-networks.qmd
- [ ] projects/orf-project.qmd 
- [ ] python/numpy-and-pandas.ipynb
- [ ] python/plotting.ipynb
- [ ] python/biopython.ipynb
- [ ] projects/assembly-project.qmd  
- [ ] ai/plan-before-you-prompt.ipynb 
- [x] neural_networks/training.qmd 
- [ ] neural_networks/digit-recognition.ipynb 
- [x] bioinf/pairwise-alignment.qmd 
- [x] projects/alignment-project.qmd 
- [x] bioinf/blast.qmd 
- [x] bioinf/dna-evolution.qmd 
- [x] bioinf/scoring-matrices.qmd 
- [ ] projects/hiv-project.qmd 
- [x] python/recursion.ipynb 
- [x] python/regular-expressions.ipynb 
- [x] ai/delegate-the-full-problem.ipynb 
- [x] projects/plasmid-project.qmd 
- [x] ai/llm.qmd 
- [x] ai/dangers-of-AI.qmd 

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

- Notebooks from "Deep learning for visual recognition" kursus af Henrik Pedersen, en ekstern lektor på datalogi. hpe@cs.au.dk
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


