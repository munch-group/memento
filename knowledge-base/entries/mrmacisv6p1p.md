- Fix kernel issue
- Add email to web pages
- Onedrive (keep downloaed)
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

