Assuming discrete non-overlapping generations, the gene variant need to pass three hurdles:

- Survive from fertilization to meiosis in sons and daughters (effects on organism) with probability $p_d$.
- Survive from meiosis to ejaculation (effects on integrity of spermatogenesis,  X carrying sperm count) with probability $p_h$
- Survive sperm competition from ejaculation to fertilization (effects on sperm X function, Y function, and sperm competition) with probability $p_c$

Total marginal fitness is $p = p_d\, p_h\, p_c$, were 

$$
\begin{align*} p_d &= \frac{f'_d}{ f_d} \\ p_h &= f'_h \\ p_c &= (1-c) t'\, f'_c + c\, \frac{t' f'_c}{t f_c} \\ &= t' f'_c \bigg(1-c+\frac{c}{t f_c}\bigg) \end{align*}
$$

Here, $p_d$ and $p_h$ are the marginal probabilities of diploid and spermatogenesis survival and $p_c$ is the marginal probability of fertilization. $f'$ and $t'$ represent individual fitness and transmission distortion and $f$ and $t$ the population means. Subscripts $f_d, f_h, f_c$ represent fitness in the diploid, haploid and competition stages. Sperm competition, $c$, is the proportion of oviduct sperm from other males. 

$$
p = \frac{f'_d}{ f_d} f'_h\, t'\, f'_c\, \bigg(1-c+\frac{c}{t f_c}\bigg)
$$

$$
s = \begin{cases} t_d t_x,& \text{with no sperm comp.} \\ > 0,& \text{with strong sperm comp.}  \end{cases}
$$

Assume an X-linked variant inducing a diploid relative fitness $f_d$ (relative to other population individuals), a haploid relative fitness $f_h$, and an X to Y transmission ratio of $t_x$. The selection coefficient on the driver will be $s = t_x f_d f_h$. 

$$
\begin{align*} s_x &= -f + t \\ s_y &= -f \\ \end{align*}
$$