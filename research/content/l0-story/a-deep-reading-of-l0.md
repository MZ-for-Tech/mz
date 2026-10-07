# A Deep Reading of \(L_0\)

**A fresh breeze carries your hat away, but thankfully the railway-station guard catches it before it lands on the tracks. That happens just before your first day in a job that irritates most storybook heroes and their authors: you are a kind-hearted, conscientious train-ticket inspector.**

**For you, it does not matter how much a passenger is carrying, as long as they have a ticket—as long as they are present, or represented to you. Any character you meet who has no ticket is treated as invisible, as though they should not be there, and must get off at the next station.**

**That is our dear \(L_0\) ticket inspector, too.**

**The \(L_0\) inspector is always ready to count the weights in a neural network. It does not matter whether a weight is large or small: the inspector asks only whether it is there. By contrast, its distant cousin, \(L_1\), measures how much each passenger is carrying and keeps adding up the weights.**

**But why count the weights that are present—or, mathematically, the nonzero weights—in a neural network? There are many reasons, but to begin with we are answering one question, or really two at once: how can we get a model with good predictions and good accuracy while using as few weights as possible? (Louizos et al., 2018; Oliveira et al., 2024)**

**That is the efficiency people talk about day and night.**

**Before you close the article because you are afraid of equations that will take two hours to look up—and then you will return having forgotten what you were reading—do not worry. This big beast is only our inspector in his official uniform, standing among his coworkers.**

## The conscientious inspector

The \(L_0\) “norm” counts the nonzero entries. For a vector of weights \(\theta\),

\[
\|\theta\|_0=\sum_j \mathbf 1\{\theta_j\ne 0\}.
\]

Here, \(\mathbf 1\{\theta_j\ne0\}\) contributes one when weight \(j\) is nonzero and zero otherwise. The subscript \(j\) is simply the index of a weight travelling through the neural network. This is the (L_0) definition used by Louizos et al. (2018).

For example, take this train of weights:

\[
\theta=(3,0,-2,0,5).
\]

The inspector counts three nonzero weights, so \(\|\theta\|_0=3\). If some weights grow and others shrink, what happens? The value of \(L_1\) changes, but \(L_0\) stays at 3, as long as none of the nonzero weights becomes exactly zero.

This is how Louizos and fellow researchers introduce \(L_0\): it is a beautiful, elegant idea, but a rather strict one. The question \(L_0\) asks is: should this weight stay on the train? But why count the nonzero weights?

### Try it yourself: count what the inspector sees

```python
weights = [3, 0, -2, 0, 5]
print("L0 count:", sum(weight != 0 for weight in weights))
print("L1 total:", sum(abs(weight) for weight in weights))
```

The result is an (L_0) count of 3 and an (L_1) total of 10.
## \(L_0\) and neural-network compression

Imagine a neural network with one million weights. If all of them are nonzero, then

\[
\|\theta\|_0=1{,}000{,}000.
\]

At first, every weight appears to be on board. But after training the network, suppose we find that only 100,000 weights affect the result—whether the result is a classification or something else. Then

\[
\|\theta\|_0=100{,}000.
\]

We have reached a good prediction using fewer active parameters; weights are among the parameters. But how did we get there? The inspector is good at counting nonzero entries. So far, though, the inspector does not know who has—or deserves—a ticket. Here Louizos and colleagues enter the story again.

If you already know a little about neural networks, you might think: let us add \(L_0\) to the training objective and let gradient descent—what I like to call “walking down the hill”—tell us what to keep.

I cannot explain neural-network learning in just two lines; I will give it more attention at the end of the series. For now, here is what we need. Training a neural network uses backpropagation: a way to work backward from the final decision toward the beginning. It is part of the process of walking downhill. Backpropagation tells us the direction of the slope, while the optimizer actually takes the step downhill.

## Walking down the hill

We are now on top of the hill. I know there have been many landscape examples in this series, but I have put you on a train travelling through green fields. To get downhill, you first need to know which way the slope goes. That is the job of the derivative:

\[
\frac{\partial L}{\partial w}.
\]

What happens if we change \(w\), the weight, by a small amount?

From the \(L_0\) point of view, reducing a weight does not change the decision: the weight is still present. The optimizer looks at the weight and tries changing its value; then it looks for a change in \(L_0\). But \(L_0\) stays the same, so there is no gradual slope leading us to the foot of the hill—that is, to zero.

That is the inspector’s strictness. When a weight reaches zero, it does not gradually descend there: it jumps from a count of 1 to a count of 0.

The inspector asks only: is the weight present or not?

So the inspector cannot ask, “Can you gradually leave the train?” The inspector simply throws the passenger off.

### Try it yourself: take a gradient step

```python
weight = 0.0
learning_rate = 0.1
for step in range(3):
    loss = (weight - 3.0) ** 2
    gradient = 2.0 * (weight - 3.0)
    weight -= learning_rate * gradient
    print(f"step {step + 1}: weight={weight:.3f}, loss={loss:.3f}")
```

This smooth example has a slope that points toward a lower loss; the hard (L_0) count does not.
## The gate

Louizos and colleagues therefore separate what had been bundled into one number—the weight itself and the decision about whether it is needed—into two parts. This leads us to:

\[
\theta_j=\tilde\theta_j z_j.
\]

Here \(\tilde\theta_j\) is the original weight, before the keep-or-remove decision. The value \(z_j\) is the decision, or gate: it is open (1) if the weight stays and closed (0) if it is removed. The value \(\theta_j\) is the weight after it passes through the gate.

So:

\[
\text{original weight}\times\text{participation decision}
=\text{effective weight}.
\]

Our inspector has developed. The inspector still watches for presence, but now there are two things: the weight a passenger carries and the passenger’s ticket (the weight’s contribution and its presence decision).

Now we have one question to answer: is the gate open?

This is the beginning of the solution to the learning problem. How do we decide when a gate opens or closes? How do we decide which gates receive 1 and which receive 0?

Since \(z\) takes either 0 or 1, and those outcomes have probabilities, it makes sense to use a Bernoulli distribution:

\[
z_j\sim\operatorname{Bernoulli}(\pi_j).
\]

If weight \(j\) is useful, the probability that gate \(z_j\) is open should rise. If its contribution is small, that probability should fall.

### Try it yourself: apply a gate

```python
weights = [4, 2, 7]
gates = [1, 0, 1]
effective = [weight * gate for weight, gate in zip(weights, gates)]
print(effective)
```

The closed middle gate makes its effective weight zero: `[4, 0, 7]`.
## Expected \(L_0\): counting gates on average

The next step is to find the expectation of \(z_j\). The symbol for expectation is \(\mathbb E\). The Bernoulli gate expectation and expected-count identity follow Louizos et al. (2018).

We have:

\[
\boxed{\mathbb E\|\theta\|_0=\sum_j\pi_j}
\]

This means:

> **The expected number of active weights is the sum of the probabilities that their gates are open.**

Start with \(\theta_j=\tilde\theta_jz_j\), where \(\tilde\theta_j\) is the original weight and \(z_j\) is its gate. If we treat \(\tilde\theta_j\) as nonzero, then the only thing that determines whether the effective weight \(\theta_j\) is present is \(z_j\).

If \(z_j=1\), then \(\theta_j=\tilde\theta_j\): the weight is present and \(L_0\) counts it as one. If \(z_j=0\), then \(\theta_j=0\): the weight is absent and \(L_0\) does not count it.

Therefore, for one weight, its contribution to the \(L_0\) count is simply \(z_j\), because \(z_j\) is either 1 or 0.

With several weights, say \(z_1,z_2,z_3\), the number of open gates in one particular draw is

\[
\|\theta\|_0=\sum_j z_j.
\]

For example, if the gates at one moment are \((1,0,1,1,0)\), then \(\|\theta\|_0=3\), because three gates are open.

But \(z_j\) is not fixed during training; it is random:

\[
z_j\sim\operatorname{Bernoulli}(\pi_j).
\]

This means \(z_j=1\) with probability \(\pi_j\), and \(z_j=0\) with probability \(1-\pi_j\).

Now we can make sense of expectation. \(\mathbb E[z_j]\) asks: if we repeat the experiment of opening and closing this gate many times, what is its average value? Since the gate is either 1 or 0,

\[
\mathbb E[z_j]=1\cdot\pi_j+0\cdot(1-\pi_j)=\pi_j.
\]

For example, if \(\pi_j=0.8\), this does not mean the gate itself has value 0.8. In each draw, the gate is still either 0 or 1. But across many draws we expect it to be open about 80% of the time, so its average approaches 0.8.

Now return to the number of weights:

\[
\|\theta\|_0=\sum_j z_j.
\]

Take the expectation. An important property says that the expectation of a sum is the sum of the expectations:

\[
\mathbb E\|\theta\|_0
=\mathbb E\left[\sum_j z_j\right]
=\sum_j\mathbb E[z_j]
=\sum_j\pi_j.
\]

For a small example, suppose we have three gates with probabilities \(\pi_1=0.9\), \(\pi_2=0.2\), and \(\pi_3=0.7\). Then

\[
\mathbb E\|\theta\|_0=0.9+0.2+0.7=1.8.
\]

This does not mean there are 1.8 actual weights. In any one draw, the number of open weights is 0, 1, 2, or 3. But if we repeat the gate sampling many times, the average number of open weights approaches 1.8.

Put simply:

> **Each passenger has a probability of having a ticket.**  
> **Add up the probabilities of all the passengers having tickets, and you get the expected number of passengers on the train.**

This is the important transition. Instead of trying to work directly with a hard count of zeros and ones, we now have \(\pi_j\), a quantity that can change gradually—for example, 0.9, 0.8, 0.6, 0.3.

That leads straight to our next question:

> **If we have made the \(L_0\) part easier this way, what is still difficult in the training objective itself?**

### Try it yourself: estimate the expected active count

```python
import random

probabilities = [0.9, 0.2, 0.7]
rng = random.Random(7)
trials = 50_000
active = sum(sum(rng.random() < p for p in probabilities) for _ in range(trials))
print("theory:", sum(probabilities))
print("simulation:", active / trials)
```

The simulated average should be close to the theoretical expectation of 1.8.
## The objective

Now the neural network must learn two things at once: to make good predictions and to keep as few components active as possible. This leaves us with the larger equation in our journey so far:

\[
\mathcal J(\tilde\theta,\pi)
=\mathbb E_z[\mathcal L(\tilde\theta\odot z)]
+\lambda\sum_j\pi_j.
\]

Do not be afraid of it. It contains the two things we are trying to teach the network: make predictions and keep the model small. Let us take it apart.

### The first part: prediction quality

\(\mathbb E_z[\mathcal L(\tilde\theta\odot z)]\) is the prediction quality. We met something similar a few pages ago, but now, instead of taking the expectation of \(z\), we take the expectation of \(\mathcal L\), the prediction loss. The loss focuses on how bad the network’s prediction is. The symbol \(\odot\) means element-by-element multiplication.

Let the weights be \((4,2,7)\) and the gates be \(z=(1,0,1)\). Then

\[
(4,2,7)\odot(1,0,1)=(4,0,7).
\]

\(\mathcal L(\tilde\theta\odot z)\) means: calculate the prediction loss using the network after the sampled gates have switched off some of its weights.

The expectation is, roughly, an average. It answers: across the gate configurations produced by these probabilities, does the prediction remain good on average?

### The second part: the inspector’s bill

The term \(\lambda\sum_j\pi_j\) is the expected number of open gates, multiplied by \(\lambda\). The parameter \(\lambda\) controls how much we charge for keeping gates open. A larger \(\lambda\) means fewer weights are allowed to remain; only contributions that matter enough will justify their cost. Each open gate becomes more expensive. A smaller \(\lambda\) gives prediction quality higher priority, while a larger \(\lambda\) gives weight removal higher priority.

During learning, the two sides of the equation argue. Prediction tries to open as many gates as needed to keep its quality high. Compression tries to close as many gates as possible. What settles the argument? The components—or gates—provide the evidence.

If a component matters, prediction loss wins: its probability \(\pi_j\) rises. If it does not matter, compression wins: its probability \(\pi_j\) falls.

We will need to think about the derivative, or gradient, of this equation. The term \(\lambda\sum_j\pi_j\) is friendly to differentiation because \(\pi_j\) is continuous. The problem is \(\mathbb E_z[\mathcal L(\cdot)]\): we are still sampling \(z\) from a Bernoulli distribution, which returns zero or one. That is the old problem again.

### Try it yourself: change the sparsity price

```python
prediction_loss = 0.18
expected_active_gates = 3.4
for sparsity_price in [0.01, 0.1, 0.5]:
    objective = prediction_loss + sparsity_price * expected_active_gates
    print(f"lambda={sparsity_price:.2f}: objective={objective:.3f}")
```

This toy calculation shows how the penalty's contribution grows with \(\lambda\); it is not a neural-network training result.
## How does the neural network learn?

Remember backpropagation? It needs a chain, like \(a\to b\to c\), whose parts we can differentiate using the chain rule.

But here the intermediate variable \(z\) follows a Bernoulli distribution. It is discrete: it is either 0 or 1. We cannot differentiate through that discrete sampling step in the ordinary way.

We have now reached Louizos’s next major step.

## Step 7: Continuous relaxation: give the gate a middle ground

So far, the gate has been:

\[
z_j\in\{0,1\}.
\]

That means 0 is closed and 1 is open. This jump is too abrupt for ordinary backpropagation.

Louizos therefore first introduces a new continuous variable:

\[
\boxed{s_j\sim q(s_j\mid\phi_j)}
\]

and then defines the actual gate by clipping:

\[
\boxed{z_j=\operatorname{clip}(s_j,0,1)}.
\]

This is the general continuous-gate recipe (Louizos et al., 2018). Do not worry about \(q\) or \(\phi_j\) yet. First, understand the idea.

Before, the gate could only be 0 or 1. Now we first create a continuous value \(s_j\), which might be \(-0.7\), 0.2, 0.65, 1.3, or any other real number. Then we pass it through \(\operatorname{clip}(s_j,0,1)\).

### What does “clip” mean?

Clipping means:

- Any value below 0 becomes exactly 0.
- Any value between 0 and 1 stays as it is.
- Any value above 1 becomes exactly 1.

Mathematically,

\[
\operatorname{clip}(s,0,1)=
\begin{cases}
0,&s\le0,\\
s,&0<s<1,\\
1,&s\ge1.
\end{cases}
\]

This is the piecewise definition. For example, if \(s_j=-0.4\), then \(z_j=0\). If \(s_j=0.25\), then \(z_j=0.25\). If \(s_j=0.8\), then \(z_j=0.8\). If \(s_j=1.6\), then \(z_j=1\).

The gate can now take values such as 0, 0.1, 0.4, 0.8, and 1, rather than only 0 and 1.

### Why is this useful?

Because the gate can now move gradually. Instead of jumping from 1 to 0 in one sharp step, it can move through 1, 0.8, 0.6, 0.3, 0. This gives gradient-based optimization something much better to work with. The mountain climber sees a gradual slope instead of a sudden cliff.

### But why use clipping at all?

This is important. You might ask: if we want continuity, why not use \(s_j\) directly?

Because we still want actual removal to be possible. If a gate were always a soft value such as 0.00001, it would technically still be nonzero. Remember that \(L_0\) cares about zero versus nonzero. Louizos therefore wants both:

\[
\boxed{\text{continuous behaviour that is easier to learn}}
\]

and

\[
\boxed{\text{exact zeros that produce sparsity}}
\]

Clipping gives us both. If \(s_j\le0\), then \(z_j=0\) exactly—not 0.00001, but a true zero. If \(s_j\ge1\), then \(z_j=1\) exactly. Clipping creates genuine zeros and ones while allowing continuous values between them (Louizos et al., 2018).

### The inspector’s analogy

The inspector no longer thinks in only two states. Before, there was a ticket or no ticket. During training now, there is a middle ground. We might have \(z_j=0.8\), meaning the weight currently contributes at 80%, or \(z_j=0.3\), meaning it contributes at 30%. If the underlying variable moves below zero, the inspector finally says, “That is it—you are removed,” and we get \(z_j=0\). We now have a gradual path toward removal.

But notice a subtle point: the actual gate is \(z_j=\operatorname{clip}(s_j,0,1)\). The continuous variable before clipping is \(s_j\). They are not the same. For example, \(s_j=-0.7\) gives \(z_j=0\), while \(s_j=1.4\) gives \(z_j=1\). So \(s_j\) can range over a wider set of real values, while \(z_j\) is forced to remain within \([0,1]\).

### The probability of an active \(L_0\) gate

The gate is active when \(z_j>0\). Because of clipping, \(z_j>0\) happens exactly when \(s_j>0\). Therefore,

\[
P(z_j>0)=P(s_j>0).
\]

If \(Q_j\) is the cumulative distribution function (CDF) of \(s_j\), then \(P(s_j>0)=1-Q_j(0)\). Thus,

\[
\boxed{P(z_j>0)=1-Q_j(0)}.
\]

This is the continuous version of the Bernoulli idea. Instead of \(\pi_j\), we now use \(1-Q_j(0)\) as the probability that the gate is active.

The new objective becomes:

\[
\mathcal J(\tilde\theta,\phi)
=\mathbb E_s\left[\mathcal L\left(\tilde\theta\odot\operatorname{clip}(s,0,1)\right)\right]
+\lambda\sum_j[1-Q_j(0)].
\]

Do not memorize this equation yet. The important idea is:

\[
\boxed{\text{binary gate}\ \longrightarrow\ \text{continuous random variable}\ \longrightarrow\ \text{clipped gate}}
\]

or, more briefly,

\[
\boxed{s_j\longrightarrow z_j=\operatorname{clip}(s_j,0,1)}.
\]

These are the bridges that later let us use different continuous distributions. That is why this step matters when we reach Gaussian gates. Louizos’s framework here is broader than Hard-Concrete itself: the general idea allows other continuous distributions, as long as we can calculate the needed probabilities and use a suitable reparameterization.

This is where the road toward Gaussian gates begins. The next question is: how do we train the parameters of the distribution that generates \(s_j\)? This is where **reparameterization** enters.

### Try it yourself: clip a continuous sample

```python
samples = [-0.3, 0.25, 1.4]
clipped = [max(0.0, min(1.0, sample)) for sample in samples]
print(clipped)
```

Clipping maps values below zero to zero and values above one to one.
## Reparameterizing randomness

At the last station, we saw that a continuous variable such as \(s_j\) is better than jumping directly between zero and one. But one important question remains: we are still sampling \(s_j\) from a probability distribution, so how can backpropagation work out how changing the distribution’s parameters changes the result?

Louizos uses an idea called **reparameterization**. The name is bigger than the idea. Instead of hiding randomness inside the sampling operation itself, we separate two things:

1. A part we learn.
2. A random part we do not learn.

In general, we write:

\[
\boxed{s_j=f(\phi_j,\epsilon_j)}
\]

where \(\phi_j\) contains the distribution parameters we want to learn, and \(\epsilon_j\) is random noise drawn from a fixed distribution that does not depend on \(\phi_j\).

The randomness has not disappeared. It has been moved into \(\epsilon_j\); then an ordinary function connects it to the parameter we want to learn.

### A quick example before Hard-Concrete

If the distribution is Gaussian, we can write:

\[
\epsilon_j\sim\mathcal N(0,1),\qquad
\boxed{s_j=\mu_j+\sigma_j\epsilon_j}.
\]

Suppose at one step \(\epsilon_j=0.6\), \(\mu_j=0.4\), and \(\sigma_j=0.5\). Then \(s_j=0.4+0.5(0.6)=0.7\).

During the backward pass, we treat the sampled value \(\epsilon_j=0.6\) as fixed for that step. If we change \(\mu_j\) from 0.4 to 0.41, \(s_j\) moves from 0.7 to 0.71. There is now a clear path for differentiation to follow:

\[
\mu_j,\sigma_j\longrightarrow s_j\longrightarrow z_j
\longrightarrow\text{prediction}\longrightarrow\mathcal L.
\]

Reparameterization does not remove randomness. It says: put the randomness in \(\epsilon\), and make the parameter we want to learn visible inside an equation we can differentiate.

But be careful: this Gaussian example only explains the general idea. Louizos did not use a Gaussian gate in his main method. He chose Hard-Concrete, which we have finally reached.

### Try it yourself: reuse fixed noise

```python
weight_parameter = 0.8
fixed_noise = -0.4
for learned_location in [-0.5, 0.0, 0.5]:
    sample = learned_location + fixed_noise
    print(f"location={learned_location:+.1f}: sample={sample:+.1f}")
```

The same noise is used each time; changing the learned location changes the sample smoothly.
# Hard-Concrete: Louizos’s gate tries to bring both worlds together

We now want something that satisfies two demands that seemed to conflict: a soft gate that can be trained through, and exact zeros for some gates so we get real \(L_0\) sparsity rather than merely small weights.

Hard-Concrete builds this in several steps, so do not try to take in the whole equation at once.

## Step 1: a simple random number

We start with:

\[
u_j\sim\mathcal U(0,1).
\]

That means we draw a random number between zero and one, such as \(u_j=0.2\) or \(u_j=0.73\). There is no open-or-closed decision yet; this is only the source of randomness.

## Step 2: turn it into Logistic noise

Louizos uses:

\[
g_j=\log u_j-\log(1-u_j).
\]

This transforms the number drawn from a Uniform distribution into Logistic noise. We do not need to dive into that distribution now. What matters is that \(g_j\) is the random part, and we will put something learnable next to it.

## Step 3: introduce \(\log\alpha_j\)

Now:

\[
q_j=\frac{g_j+\log\alpha_j}{\beta},
\qquad
\tilde s_j=\operatorname{sigmoid}(q_j).
\]

Here is the first important quantity the network learns:

\[
\boxed{\log\alpha_j}.
\]

Think of it as a handle that moves the gate distribution. Moving it in the positive direction makes the gate more inclined to open; moving it toward the negative direction makes it more inclined to close.

The parameter \(\beta\) is the temperature. It controls how sharp or soft the transition is. You do not need to memorize the effect of every value yet. Just remember that \(\log\alpha_j\) is learned for each gate and \(\beta\) controls the shape of the relaxation.

The sigmoid takes any real number and compresses it into \((0,1)\). So \(\tilde s_j\) is now a soft value between zero and one.

## But a value confined to \((0,1)\) cannot give us an exact zero

Here comes Hard-Concrete’s key move. Louizos does not stop at a value between zero and one; he stretches the range a little beyond both ends:

\[
\boxed{\bar s_j=\tilde s_j(\zeta-\gamma)+\gamma}
\]

where \(\gamma<0\) and \(\zeta>1\). The paper uses, for example, \(\gamma=-0.1\), \(\zeta=1.1\), and \(\beta=\frac23\).

Why stretch it? Imagine \(\tilde s_j\) was trapped between zero and one. After stretching, some values can fall below zero and others can exceed one. Then we apply the move we already know:

\[
\boxed{z_j=\operatorname{clip}(\bar s_j,0,1)}.
\]

Values below zero become exact zeros, values above one become exact ones, and values between them remain soft.

### Why is it called Hard-Concrete?

Concrete gives us a smooth continuous relaxation (Maddison et al., 2017). “Hard” refers to clipping, which creates an actual point mass at zero and at one.

The whole idea can be summarized as:

\[
u\longrightarrow\text{Logistic noise}\longrightarrow\text{sigmoid}
\longrightarrow\text{stretch}\longrightarrow\text{clip}.
\]

In plain terms, the decision is no longer a ticket that suddenly appears. First there is a smooth path; at the end are two barriers. Anything falling below zero has the door closed completely, and anything passing one has the gate fully open.

# The probability that a Hard-Concrete gate is open

We do not want only one sample \(z_j\); we also need the probability that the gate is nonzero, so that we can calculate the \(L_0\) penalty. For Hard-Concrete, this probability can be computed directly:

\[
\boxed{
p_j=P(z_j>0)=
\operatorname{sigmoid}\left(\log\alpha_j-
\beta\log\frac{-\gamma}{\zeta}\right)
}
\]

Do not memorize it yet. The important point is that, as with \(\pi_j\), we have a quantity \(p_j=P(z_j>0)\). We can add up \(\sum_jp_j\) to get the expected number of active gates.

When we minimize the objective, the \(L_0\) penalty pushes these probabilities downward, while prediction loss pushes the probabilities upward for gates the model needs.

# Does this mean every \(z_j\) is now zero or one?

No. During training a gate may be, for example, \(z_j=0.37\) or \(z_j=0.82\), because we are still using a continuous relaxation. At other times, clipping saturates it and makes it exactly zero or one.

So Hard-Concrete does not mean that every forward pass is a completely binary network. It is a clipped continuous distribution that can also produce genuine zeros and ones.

# Louizos’s test-time gate is not the same as a training sample

This is important, and we will need it when considering practical use later. During training, we draw random samples. At test time, we do not want the model’s result to change every time a new random sample is drawn, so Louizos gives a deterministic gate based on the location it learned:

\[
\boxed{
\hat z_j=\operatorname{clip}\left(
\operatorname{sigmoid}(\log\alpha_j)(\zeta-\gamma)+\gamma,
0,1\right)
}
\]

Notice that it may still be fractional. A deterministic gate does not necessarily mean 0 or 1; it might be 0.6.

From now on, we must distinguish three things: the random training sample, the deterministic evaluation gate, and the final binary decision that actually removes something from the model.

### Try it yourself: draw one Hard-Concrete gate

```python
import math
import random

rng = random.Random(7)
beta, gamma, zeta, log_alpha = 2 / 3, -0.1, 1.1, 0.0
u = rng.random()
logistic_noise = math.log(u) - math.log1p(-u)
soft = 1 / (1 + math.exp(-(logistic_noise + log_alpha) / beta))
stretched = soft * (zeta - gamma) + gamma
gate = max(0.0, min(1.0, stretched))
print(f"u={u:.4f}; gate={gate:.4f}")
```

The last clipping step can produce an exact zero or one.
# From one weight to a whole carriage: group sparsity

So far, we have spoken as if every weight had its own gate. But Louizos also allows an entire group to share one gate.

This brings us to the question we left open at the start: how can the method remove a whole channel instead of a single weight?

If we put one gate in front of a group of weights, \(z_g=0\) closes the whole group, not just one weight. In a convolutional neural network, that group could be a complete output feature map.

Each channel has one gate, and that gate multiplies the entire feature map:

\[
\tilde h_j=z_jh_j.
\]

If \(z_j=0\), the whole feature map disappears—not one pixel and not one weight. The inspector’s ticket now belongs to an entire train carriage, not one passenger. If the carriage’s gate closes, everything inside it leaves the journey.

## But what are we counting?

If we add only \(\sum_gP(z_g>0)\), we are counting the expected number of active groups or channels. That is not necessarily the number of parameters, because different channels may contain different numbers of weights.

If group \(G_g\) contains \(|G_g|\) weights, then the expected number of active weights is:

\[
\mathbb E\|\theta\|_0
=\sum_g |G_g|P(z_g>0).
\]

So we must not confuse the number of channels, the number of weights, FLOPs, and actual speed. This distinction matters when we consider what pruning changes in practice.

### Try it yourself: count expected groups and expected weights

```python
group_sizes = [6, 4]
active_probabilities = [0.8, 0.25]
print("groups:", sum(active_probabilities))
print("weights:", sum(n * p for n, p in zip(group_sizes, active_probabilities)))
```

The expected count is 1.05 groups but 5.8 weights because the group sizes differ.
# What does a Louizos training step look like?

We can now see the whole journey in one training step.

First, we draw noise for the gates. Then we transform it through Hard-Concrete into \(z\). We multiply the weights by the gates:

\[
\theta=\tilde\theta\odot z.
\]

Next, we run the forward pass and calculate prediction loss. Then we calculate the expected activity penalty from the gate probabilities:

\[
\lambda\sum_jP(z_j>0).
\]

We add the two terms. Backpropagation returns through the path we created with reparameterization and updates both the network weights and the gate parameters.

Louizos did not know in advance who deserved a ticket. Instead, prediction quality and the complexity penalty argue during training. Their interaction moves the gate parameters so that some parts become more likely to stay and others more likely to close.

# Here we need to stop the train for a moment

After all this, it is easy to say: “So the Gaussian gate we will use next is Louizos’s method.” But that is not correct.

Louizos gave us the general framework for \(L_0\) with clipped continuous gates, but his main method uses Hard-Concrete. The Gaussian stochastic gate has another direct source, which we will reach now: Yamada and colleagues.

# From Hard-Concrete to Gaussian: the same structure, a different parent

The general idea we took from Louizos is:

\[
\boxed{\text{continuous sample}\longrightarrow\text{clip}\longrightarrow\text{exact zero is possible}}
\]

Alongside this, we calculate the probability that the gate is active from the CDF of the distribution that generated it.

Hard-Concrete uses Logistic noise and a sigmoid. Yamada says: we can use the same idea with a simpler Gaussian variable.

# Yamada et al.: Gaussian stochastic gates

In Yamada’s method, each feature has its own stochastic gate (Yamada et al., 2020). The original expression can be written:

\[
\boxed{z_d=\operatorname{clip}(m_d+\eta_d,0,1)},
\qquad \eta_d\sim\mathcal N(0,\sigma^2).
\]

Using reparameterization, the same expression is:

\[
\epsilon_d\sim\mathcal N(0,1),\qquad
s_d=m_d+\sigma\epsilon_d,\qquad
z_d=\operatorname{clip}(s_d,0,1).
\]

Here \(m_d\) is the parameter we learn and \(\sigma\) is the amount of noise. In Yamada’s construction, the noise scale is fixed while we learn the location \(m_d\).

# What does \(m_d\) do?

Imagine a Gaussian curve moving along the number line. If we push \(m_d\) to the right, more of the distribution lies above zero, and the chance that the gate is open rises. If we push it to the left, more of the distribution moves below zero; after clipping, that part becomes zero.

So \(m_d\) is the handle that gradually decides whether the feature deserves to stay.

# The activity probability for a Gaussian gate

The gate is active when \(z_d>0\). Since clipping changes only values of \(s_d\le0\) into zero,

\[
z_d>0\iff s_d>0.
\]

But \(s_d=m_d+\sigma\epsilon_d\), so:

\[
P(z_d>0)=P(m_d+\sigma\epsilon_d>0)
=P\left(\epsilon_d>-\frac{m_d}{\sigma}\right).
\]

Using the symmetry of the normal distribution, we get:

\[
\boxed{P(z_d>0)=\Phi\left(\frac{m_d}{\sigma}\right)},
\]

where \(\Phi\) is the cumulative distribution function of the standard normal distribution. It tells us the area under the Gaussian curve to the left of a chosen value.

## Example

If \(m_d=0.4\) and \(\sigma=0.5\), then \(m_d/\sigma=0.8\). Therefore,

\[
P(z_d>0)=\Phi(0.8)\approx0.79.
\]

This means the gate will be nonzero in about 79% of samples over the long run. Again, 0.79 is not the value of the gate itself. It is the probability that the gate is greater than zero.

# The \(L_0\) penalty in Yamada’s method

Instead of summing \(\pi_j\), as we did with Bernoulli, or using the special Hard-Concrete formula, we now sum:

\[
\boxed{\sum_d\Phi\left(\frac{m_d}{\sigma}\right)}.
\]

This gives us the expected number of active gates. Once again, the objective has the form:

\[
\text{prediction loss}
+\lambda\sum_d\Phi\left(\frac{m_d}{\sigma}\right).
\]

The \(L_0\) penalty pushes \(m_d\) to the left to lower the probability of activity. Prediction loss pushes important gates in the opposite direction.

### Try it yourself: compare the Gaussian probability with a simulation

```python
import math
import random

mu, sigma, trials = 0.3, 0.5, 50_000
formula = 0.5 * (1 + math.erf((mu / sigma) / math.sqrt(2)))
rng = random.Random(7)
measured = sum(mu + sigma * rng.gauss(0, 1) > 0 for _ in range(trials)) / trials
print(f"formula={formula:.4f}; simulation={measured:.4f}")
```

The simulation should approach \(\Phi(m/\sigma)\) as the number of draws grows.
# Did Yamada remove channels?

No, not in the original paper. This is a point we must preserve.

Yamada mainly used the gate for feature selection at the network input: each input feature has its own gate. The original paper uses Gaussian gates for input-feature selection. How a related gate might support group-level choices is a question for a later part of this journey.

# Why Gaussian instead of Hard-Concrete?

Yamada introduced Gaussian stochastic gates as an alternative to distributions built from Logistic noise, and reported more stable feature selection than Hard-Concrete in the experiments in that particular setting.

But we should not jump from that sentence to: “Gaussian is always better than Hard-Concrete.” That is not what the paper proves.

The careful statement is: they are two different ways to build the same general idea of a clipped continuous gate, and Yamada gave the Gaussian gate direct support in a feature-selection setting.

# Hard-Concrete and Gaussian side by side

The shared structure is:

\[
\text{noise}\longrightarrow\text{continuous sample}
\longrightarrow\text{clip}\longrightarrow z\in[0,1].
\]

With both methods, clipping can produce exact zeros, and we can calculate the activity probability and turn it into an \(L_0\) penalty. What differs is the distribution that generates the sample and the formula for the activity probability.

**Hard-Concrete:**

\[
P(z_j>0)=\operatorname{sigmoid}\left(\log\alpha_j-
\beta\log\frac{-\gamma}{\zeta}\right).
\]

**Gaussian:**

\[
P(z_j>0)=\Phi\left(\frac{m_j}{\sigma}\right).
\]

The inspector has not changed jobs. What changed is the machine that generates the probabilities of opening the gates.

# A Hint of What’s to Come

A later part of this journey will ask what changes when one decision applies to a whole group rather than to one passenger at a time. We will consider when a learned gate becomes a practical structural choice, and why making a component inactive is not always the same as removing the computation it requires.

For now, keep this question in mind: when a whole group shares one decision, what should count as a ticket, and what does it mean for the group to leave the train?

# Back to the inspector

At the beginning, our inspector knew only how to count passengers: present or absent. Then the inspector discovered that counting alone does not say who deserves a ticket.

We separated the weight from the decision about whether it exists. We made that decision probabilistic, then found a continuous path through reparameterization. Louizos built Hard-Concrete for that path; Yamada used a Gaussian route.

The central question remains:

\[
\boxed{\text{How can we preserve good predictions while keeping fewer components—the ones that truly deserve to stay?}}
\]

## References

Louizos, C., Welling, M., & Kingma, D. P. (2018). Learning sparse neural networks through \(L_0\) regularization. In *Proceedings of the International Conference on Learning Representations*. [Full text](https://arxiv.org/abs/1712.01312).

Maddison, C. J., Mnih, A., & Teh, Y. W. (2017). The Concrete distribution: A continuous relaxation of discrete random variables. In *Proceedings of the International Conference on Learning Representations*. [Paper](https://arxiv.org/abs/1611.00712).

Oliveira, F. D. R., Batista, E. L. O., & Seara, R. (2024). On the compression of neural networks using \(\ell_0\)-norm regularization and weight pruning. *Neural Networks, 171*, 343–352. [https://doi.org/10.1016/j.neunet.2023.12.019](https://doi.org/10.1016/j.neunet.2023.12.019)

Yamada, Y., Lindenbaum, O., Negahban, S., & Kluger, Y. (2020). Feature selection using stochastic gates. In *Proceedings of the 37th International Conference on Machine Learning* (Vol. 119, pp. 10648–10659). [Proceedings and paper](https://proceedings.mlr.press/v119/yamada20a.html).
