
```
%%test

from pytest import approx
from im_pytest import requires

CODON_MAP = {
    'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L', 'TCT': 'S', 'TCC': 'S',
    'TCA': 'S', 'TCG': 'S', 'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
    'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W', 'CTT': 'L', 'CTC': 'L',
    'CTA': 'L', 'CTG': 'L', 'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
    'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q', 'CGT': 'R', 'CGC': 'R',
    'CGA': 'R', 'CGG': 'R', 'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
    'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T', 'AAT': 'N', 'AAC': 'N',
    'AAA': 'K', 'AAG': 'K', 'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
    'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V', 'GCT': 'A', 'GCC': 'A',
    'GCA': 'A', 'GCG': 'A', 'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
    'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G',
}

GENOME_FILE = "e_coli_O157_H157_str_Sakai.fasta"


@requires("find_start_positions")
def test_find_start_positions(module):
    ...


@requires("find_next_codon")
def test_find_next_codon(module):
    ...


@requires("find_next_stop_codon")
def test_find_next_stop_codon(module):
    ...


@requires("find_orfs")
def test_find_orfs(module):
    ...


@requires("translate_codon")
def test_translate_codon(module):
    ...

@requires("split_codons")
def test_split_codons(module):
    ...


@requires("translate_orf")
def test_translate_orf(module):
    ...


@requires("read_genome")
def test_read_genome(module):
    ...

@requires("find_candidate_proteins")
def test_find_candidate_proteins_small(module):
    ...


@requires("find_candidate_proteins", "read_genome")
def test_find_candidate_proteins_genome(module):
    ...




def find_start_positions(seq):
    ...


def find_next_codon(seq, start, codon):
    ...



def find_next_stop_codon(seq, start):
    ...



def find_orfs(seq):
    ...



def translate_codon(x):
    ...



def split_codons(orf):
    ...



def translate_orf(orf):
    ...



def read_genome(file_name):
    ...



def find_candidate_proteins(seq):
    ...

```

- Ebbe about his setup
- Add email and weekplan link to web pages
- Screen shot from black girl
- Screencast with setup walk-through
- Maybe make a short version of setup without explanations
- Stress that they read closely and do things in right order
- Explain the terminal/win powershell prompt can look very different
- lock file v6 vs v7
- Make sure the "prompt" > is gone everywhere
- Add to im doctor"
  - to let student. know if he/she is in an empty instructing machines folder
- bash vs zsh (maybe it is the piping to sh that makes it end up in bash and not zsh) - maybe change sh to $SHELL or $(dscl . -read ~ UserShell | sed 's/UserShell: //')
  - to update all config, script, tasks in student folder if older than github repo versions
  - to check if env is activated
  - to check if the interacting-machines is active finds the python in .pixi
  - to check if env is active but they are not in the student folder.
  - to check if PATH is added to wrong shell and if so add it to default shell too
  - to fix pixi clean + pixi install if student folder was moved
  - to fix script permissions issue on windows (Set-ExecutionPolicy RemoteSigned -Scope CurrentUser  or  Set-ExecutionPolicy -ExecutionPolicy Unrestricted)

# TODO:
- Oracle promping to identify specification
- Prompting: practise exhaustive specification rather than providing it
- Turtle obstacle competition and gladiator turnament
- Ensure an early experience that AI does cannot produce what they want, that there are prompts they are not able to express, it produces results they cannot validate.
- Add exercises for *recalling*: "Write some code that uses all the building blocks you know so far". "List all the rules you know so far. Both specific and general". "List the general rules you know (E.g. the meaning of a colon)".

- [x] Finish coherent draft of all chapters
- [x] Identify sequence of projects and the role of each one. 
- [x] Introduction explaining ai-arc and exercise badges.
- [x] Make notes on script-vs-nobook and jupyter-ui
- [x] Make draft slides
- [x] Consider using the turtle widget as a fun through-line as well - same as the projects.
- [x] Notes explaining Jupyter in VScode
- [x] Have Claude write classes (based on my slides).
- [x] Have Claude write data analysis and visualization chapter (pandas and iplot)
- [x] Have Claude write chapter about modules and packages
# Projects:
- [ ] pytest unit/usage testing: notebooks / projects / tests produced by AI
- [ ] Figure out sequence of projects and which part (decomposing (signatures), implementing, testing) they do for each one:
- [ ] Change project texts to accommodate the role of the project.
# Finish
- [ ] Read through and add exercise widgets to chapters: Make (almost) all exercises %%sandbox exercises. Add steps-widget to precedence-steps and values-operators-logic chapters and selectively (sparingly) where it adds value like slicing, function calls, dict of dict. Sprinkle `%%puzzle` throughout. Add `%%codelens` to functions, lists, dicts.
- [ ] Sort out slides
# Nice:
- [ ] Make cheatsheets and overview visuals
- [ ] Make snippet casts
- [ ] Screencasts showcasing vscode UI.

