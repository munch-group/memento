
The x comes from the chain rule. The loss doesn't depend on w directly. It depends on w only through the output y:

$$
L = (y - t)^2, \qquad y = w \cdot x
$$

So the slope of the loss with respect to w is two factors multiplied together:

$$
\frac{dL}{dw} = \underbrace{\frac{dL}{dy}}{2(y - t)} \times \underbrace{\frac{dy}{dw}}{x}
$$

- 2 * (y - target) says how fast the loss changes when the output changes.
- x says how fast the output changes when the weight changes. Since y = w * x, nudging w by a small amount δ moves y by x · δ. With x = 2, the output moves twice as far as the weight.

Multiplying them gives how fast the loss changes per unit change in w.

Check against the prose: with x = 2 and t = 6, y = 2w, so
2 * (2w - 6) * 2 = 8w - 24, which is the slope the text derives from (2w − 6)².

Why it matters later: this is the same idea backpropagation builds on in the next section. Each factor is a local "how much does this change that", and you multiply them along the chain from the loss back to the weight. In the two-neuron example you get dL/dw₁ = 2(y − t) · w₂ · x, with one more factor for the extra link.

I didn't change any text. While reading the passage I noticed a few things you may want to fix yourself:
- Line ~100: "the slope is $-0.1596 / 0.01 = 15.96$" is missing a minus sign on the result. It should be −15.96.
- The next paragraph says "agreeing with the $15.96$", which is missing the same minus sign.
- The prose asks students to predict where w ends up "after ten steps", but the loop runs range(15).