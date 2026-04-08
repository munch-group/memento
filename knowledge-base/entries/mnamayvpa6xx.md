Hypothesis: LoF and pathogenic non-synonymous changes are positively selection in autosomal genes that are coopted by drivers to distort transmission because restoring even transmission is more strongly selected than the collateral effect on fertility. Monogami could be a derived feature to cope with low fertility, rather than being the cause of relaxed selection. It would seem that the very low meiotic index and fertility in humans should affect fitness…

Are the **LoF** too rarely on internal branches? And is it mainly mainly spermatid extressed genes interacting with potential drivers?

Are autosomal human-nean admixed genes enriched for genes **lof** in Neanderthals? Is the same true for the recent reverse admixture?

Is there more often **ILS trees** when the  outgroup lineage has a **LoF**? Suggesting introgression to rescue. Look at Gnomad and Ikers data 

**ILS idea**: Try to do a cov matrix for 100kb ILS “skewness” (HG)C-(CG)H proportions across trios. Should produce matrix of how well tree topologies track each other across genome. Do a PCA of that like for HiC.

Did Humans and Gorilla loose the same genes?

Do the lost genes tend to be ILS-void?

Do the lost genes tend to be ILS “outgroup” genes?

What is the probability of the allele frequencies without invoking positive selection?

If loss of TTLL10 followed CFAP47 or DYNLT3 drive, can we see that somehow?

Are there more LoF genes on X?

Is it only some pathogenic positions that that evolve under pos sel.?

Is it only genes:

- with PPI to drivers?
- Post-meiotically expressed?

Is there positive selection on genes lost in humans?

Are any lost genes exchanged with archaic humans?

## TTLL10 with Tomi

> It was very nice meeting someone interested in sperm and my TTLL10 project. To remind you, humans and western gorillas have both acquired mutations that inactivate TTLL10 and not only that, but they seem to be acquiring other mutations as if the gene is not under any constraint anymore.

One of the thing we agreed I should send you are the impact (pathogenicity) scores of each missense mutation that is found in human and then you could take a use that in your two population of baboons. As I undersand, one of the populations is multi-male/multi-female and another one is a harem). You can find the scores in this file from AlphaFold: [https://zenodo.org/records/8208688/files/AlphaMissense_hg38.tsv.gz?download=1](https://eur01.safelinks.protection.outlook.com/?url=https%3A%2F%2Fzenodo.org%2Frecords%2F8208688%2Ffiles%2FAlphaMissense_hg38.tsv.gz%3Fdownload%3D1&data=05%7C02%7Ckaspermunch%40birc.au.dk%7C15a8f2a47eea4408d81608ddeca11315%7C61fd1d36fecb47cab7d7d0df0370a198%7C1%7C0%7C638926898925736985%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=i64o2gn%2B6%2FGuBw8L9BsLTZX8zxh4gp9FnUO0MkwF2qg%3D&reserved=0) The column you're interested in is **am_pathogenicity** Calibrated AlphaMissense pathogenicity scores (ranging between 0 and 1), which can be interpreted as the predicted probability of a variant being clinically pathogenic.

Some more files from where that came from and a README you can find here: [https://zenodo.org/records/8208688](https://eur01.safelinks.protection.outlook.com/?url=https%3A%2F%2Fzenodo.org%2Frecords%2F8208688&data=05%7C02%7Ckaspermunch%40birc.au.dk%7C15a8f2a47eea4408d81608ddeca11315%7C61fd1d36fecb47cab7d7d0df0370a198%7C1%7C0%7C638926898925759641%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=GSe%2Fnr1I788K1w4aReyIrb%2F8NHjtHXs%2FwBoo4UgB6qQ%3D&reserved=0)
What Sabina (cc-ed here) from our group found is that when she looked at TTLL10 coding sequence in many individuals of human, gorilla, chimpanzee and orangutan, the more missense variants an individual had, the bigger was summarized pathogenic score and for chimpanzees (red dots) and orangutans (green dots) the relationship was almost linear. For humans (purple) and gorillas (red) there was a bigger spread on the Y-axis suggesting accumulation of pathogenic mutations and relaxation of constraint. It would be cool to see a similar graph for your baboon species.
> 

![ofwz4ZB7TDMfIlpN.png](attachment:08353444-71f9-4ce8-8df2-6e1ecd7d2581:ofwz4ZB7TDMfIlpN.png)

- Why the linear relationship? What does it represent? Does the cummulative pathogenicity make sense?
- Where in the gene are the missense variants? What are their frequences?
- Which ones are shared by all gorillas/humans?
- Could there have been selection on the first ones?

[TTLL10.html](attachment:244973c0-b7e8-4abc-ac4d-9c4a01be6c3d:TTLL10.html)

**As alternative to Ensembl Compara, maybe use oma database api to retrieve sets of homologous genes:**

https://omabrowser.org/api/docs

https://github.com/DessimozLab/pyomadb/tree/master