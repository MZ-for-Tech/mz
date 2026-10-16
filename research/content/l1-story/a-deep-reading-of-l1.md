**A Bird Building Its Nest**

Sometimes a beginning is strong: it catches your attention and leaves you searching for an answer throughout the story. At other times it seems ordinary, giving no hint of what will follow or what will stay with you.

You may wonder what this introduction has to do with a symbol or a story, but a metaphor can make the explanation flow. So imagine a bird trying to build its nest; it cannot carry every branch it finds, and must choose enough to build with.

We will return to it when numbers become choices, but let us stay with three ordinary numbers for now.

The 39 Python examples share state and are intended to run in order. [Download the complete script](/research/l1/experiments.py) and [its requirements](/research/l1/requirements.txt).

**What Is $L_{1}$?**

Suppose we have three numbers: 3, −4, and 2. Put them in a vector and call it w.

Geometrically, that vector might describe a direction or displacement; its entries might also be weights learned by a model. Our question is simpler for now: how large are these numbers together?

We need a norm to measure the vector, and $L_{1}$ does this by adding the absolute value of each entry: remove its sign, then add the magnitudes. The index j identifies an entry and d counts the entries, so our vector has $L_{1}$ magnitude 9.

Run the code blocks in order; the first imports NumPy; other tools appear when we need them.

$$
w=(w_1,\ldots,w_d),\qquad \|w\|_1=\sum_{j=1}^{d}|w_j|,\qquad \|(3,-4,2)\|_1=9.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### What does the sum collect?

The vector w is an ordered list of numbers, and wⱼ is the entry at position j. The dimension d counts the positions.

The Σ symbol says to repeat the operation from the first position to the last and add the results. Single bars in |wⱼ| remove an entry’s sign; double bars in ‖w‖₁ measure the whole vector using $L_{1}$.

#### Remove signs, then add

For $(3, -4, 2)$, first obtain magnitudes $(3, 4, 2)$, then add 3+4+2=9. Adding the original entries gives 1 because signs cancel, answering a different question.

Reordering entries or changing their signs preserves $L_{1}$, while doubling every entry doubles it.

#### A measurement does not select

This equation measures a vector that already exists. It does not turn −4 into zero or decide which entry to remove.

Regularization begins when this quantity becomes a cost paid while searching for a new vector.

</details>

```python
import numpy as np
w = np.array([3., -4., 2.])
print(np.abs(w).sum())  # 9.0
```

**The Club of Norms**

The reason for taking absolute values appears if we use $(100, -100)$. Ordinary addition gives zero although both entries are large; $L_{1}$ gives 200.

Mathematicians require conditions before admitting a measurement into the club of norms: it must be nonnegative, vanish only at the zero vector, scale by |c| when the vector is multiplied by c, and obey the triangle inequality. That last condition says that the magnitude of a sum cannot exceed the sum of the magnitudes.

In distance terms, a direct route cannot be longer than a route through an intermediate point when both use the same norm. To make the scaling example precise, w=$(3, -2)$ gives 2w=$(6, -4)$, whose magnitude is 10, twice 5.

$$
\|w\|_1\ge0,\quad \|w\|_1=0\iff w=0,\quad \|cw\|_1=|c|\|w\|_1,\quad \|u+v\|_1\le\|u\|_1+\|v\|_1.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### The entry conditions

The four conditions require a nonnegative magnitude, zero only for the zero vector, scaling by |c| under multiplication by c, and the triangle inequality. The symbol ⇔ means both implications hold: the zero vector has zero norm, and a zero norm implies a zero vector.

#### Why an absolute multiplier?

A negative c changes direction without making magnitude negative, so the scaling factor is |c|. For w=$(3, -2)$, the norm is 5; for −2w=$(-6, 4)$, it is 10.

Entrywise, |cwⱼ|=|c||wⱼ|; summing lets us factor out |c|.

#### Direct and combined routes

Sum |uⱼ+vⱼ|≤|uⱼ|+|vⱼ| over entries to obtain the vector triangle inequality. With u=$(2, -1)$ and v=$(-1, 3)$, their sum has norm 3, while their separate norms total 7.

Equality is allowed; the inequality does not claim the sum is always strictly smaller.

</details>

```python
w = np.array([3., -2.])
u, v = np.array([2., -1.]), np.array([-1., 3.])
print(2*w, np.abs(2*w).sum(), 2*np.abs(w).sum())
print(np.abs(u+v).sum() <= np.abs(u).sum()+np.abs(v).sum())
```

**From Streets to Shapes**

Geometrically, $L_{1}$ measures Manhattan distance. Reaching $(3, 2)$ from $(0, 0)$ through horizontal and vertical streets costs 5 units, whereas the straight line has length $\sqrt{13}$.

Collect all points whose norm is at most one, and $L_{1}$ gives a diamond, $L_{2}$ a disk, and $L_{\infty}$ a square. These shapes are more than decoration: their boundaries will later help determine where a solution can settle.

Still, calculating a norm alone changes no model; regularization begins when we give that magnitude a cost inside an optimization problem.

<!-- visual:l1-norm-balls -->

```python
point = np.array([3., 2.])
print("Manhattan:", np.abs(point).sum())
print("Euclidean:", np.linalg.norm(point))
```

**The Family and Its Distant Cousin**

Our protagonist belongs to a wider family. For $p\ge 1$, add the pth powers of the magnitudes and take the corresponding root.

At $p=1$ we obtain $L_{1}$, at $p=2$ Euclidean length, and as p grows without bound we obtain the largest individual magnitude. Its distant cousin $L_{0}$ counts nonzero entries, so it fails the homogeneity required of a true norm: doubling the entries does not double their count.

For $(3, 4, 0)$, the values are $L_{0}=2$, $L_{1}=7$, $L_{2}=5$, and $L_{\infty}=4$. Each answers a different question; two vectors can therefore have the same $L_{1}$ norm while using very different numbers of entries.

$$
\|w\|_p=\left(\sum_{j=1}^{d}|w_j|^p\right)^{1/p},\qquad \|w\|_\infty=\max_j|w_j|,\qquad \|w\|_0=\#\{j:w_j\ne0\}.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Which question does p answer?

The parameter p sets how magnitudes combine: raise each to p, add, then take the pth root. At $p=1$ nothing changes; at $p=2$ this is the square root of a sum of squares.

Requiring $p\ge 1$ makes the expression a norm. Substituting $p=0$ into this displayed root does not define $L_{0}$.

#### From a sum to the largest entry

Large p increasingly emphasizes the largest magnitudes. Let $m=\max |w_j|$.

The p-norm lies between m and $d^{1/p}$m. As p tends to infinity, $d^{1/p}$ tends to 1, so both bounds meet at m, explaining $L_{\infty}$.

#### The cousin that counts

The # symbol counts entries satisfying $w_{j}\ne 0$. For $(3, 4, 0)$, that count is 2, whereas $L_{1}=7$, $L_{2}=5$, and $L_{\infty}=4$.

Doubling the vector preserves the count instead of doubling it, explaining why the quantity called $L_{0}$ is not a norm.

</details>

```python
w = np.array([3., 4., 0.])
print(np.count_nonzero(w), np.abs(w).sum(),
      np.linalg.norm(w), np.max(np.abs(w)))
a, b = np.array([1., 0., 0., 0.]), np.full(4, .25)
print(np.abs(a).sum(), np.abs(b).sum(),
      np.count_nonzero(a), np.count_nonzero(b))
```

**Where Did the Story Begin?**

We may now ask who created $L_{1}$. Absolute value has no single beginning that can be assigned to an inventor: absolute-deviation estimation predates machine learning, and the development of $L_{p}$ spaces is a separate mathematical story.

Specific methods are easier to attribute. Hoerl and Kennard developed Ridge regression in 1970 to address unstable coefficients; Williams studied Laplace-prior regularization and pruning in neural networks in 1995; Tibshirani introduced Lasso in 1996, combining regression shrinkage with variable selection.

Chen, Donoho, and Saunders developed Basis Pursuit in 1998, followed by Elastic Net in 2005 and major compressed-sensing results in 2006. Each landmark added a question rather than erasing earlier work.

**How Many Branches Do We Need?**

Return to the bird: choosing concerns the number of branches, not just their combined length. A vector is sparse when most entries are zero, and its support S(w) is the set of positions occupied by the remaining entries.

The support of $(0, 4, 0, -2, 0, 0)$ is {2, 4}, so its $L_{0}$ count is 2. To charge a fixed cost for every retained entry, we can add $\lambda L_{0}$ to the fitting loss F.

Searching over subsets can be difficult, since d positions allow $2^{d}$ subsets. In the one-coordinate example, compare the zero solution’s cost $a^{2}/2$ with the cost $\lambda$ of keeping a.

Choose zero when its cost is lower and keep a unchanged when $\lambda$ is lower; at equality both are optimal. Many small entries are not exact sparsity, although a sparse approximation may represent them well.

<!-- visual:l1-count-magnitude -->

$$
\min_w F(w)+\lambda\|w\|_0,\qquad \min_w\frac12(w-a)^2+\lambda\mathbf1_{w\ne0}.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Fitting and retaining

The min symbol asks for a w minimizing the total. F measures fitting error, and $\lambda\ge 0$ is the price of each nonzero entry.

In the scalar example, $F=\frac{(w-a)^2}{2}$, where a is the data-preferred value. The indicator 1_{w≠0} equals 1 for a retained nonzero value and 0 at zero.

#### Compare two choices

At w=0, the cost is $a^{2}/2$ with no retention penalty. For a≠0, the best nonzero choice is w=a, giving zero fitting error and cost $\lambda$.

Compare $a^{2}/2$ with λ: zero wins below $|a|=\sqrt{2\lambda}$, retention above it, and both tie at the boundary. If a=0, zero is optimal.

#### Why does the survivor stay unchanged?

With a=0.6 and $\lambda=0.3$, zero costs 0.18 rather than 0.3. A sufficiently large a survives unchanged because the penalty charges for using the entry, not for its magnitude.

This distinguishes hard thresholding from the soft thresholding ahead.

</details>

```python
w = np.array([0., 4., 0., -2., 0., 0.])
print("Support, counted from 1:", np.flatnonzero(w)+1)
a, lam = .6, .3
hard_solution = 0. if a*a/2 <= lam else a
print("Hard threshold:", hard_solution)
```

**What Does Convex Mean?**

We now need the word convex, because ease of optimization is not merely a description. Join two points on a convex function’s graph with a straight line, and the graph stays below or on that line.

The following inequality states this when a and b are mixed in proportion t. Every local minimum of a convex function on a convex domain is global, but this alone guarantees neither uniqueness nor existence.

Absolute value is convex despite its corner at zero, and squared regression loss is convex in the coefficients, so their sum in Lasso is convex. $L_{0}$ instead jumps at zero: mixing 0 and 1 equally gives cost 1 at the midpoint, larger than the average cost 1/2.

Adding a convex penalty to a nonconvex neural-network loss does not make the entire problem convex; nonsmoothness and nonconvexity are different properties.

$$
F(ta+(1-t)b)\le tF(a)+(1-t)F(b),\qquad 0\le t\le1.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Mix two points

Choose t between 0 and 1 so ta+(1−t)b lies between a and b. The left side evaluates the function there; the right side mixes endpoint function values in the same proportions.

Convexity requires the interior value not to exceed that average. One successful example is insufficient: the condition must hold for all eligible points and proportions.

#### Hold the idea in an example

For absolute value, a=−2, b=3, and t=0.4 give a mixed point 1 with value 1, versus endpoint average 2.6. The nonzero indicator instead gives 1 at the midpoint of 0 and 1, exceeding the endpoint average 0.5.

#### What convexity permits

On a convex domain, a local minimum is global, but solutions can be multiple and an infimum may not be attained. A corner at zero does not destroy convexity: smoothness concerns derivatives, while convexity concerns this inequality.

</details>

```python
a, b, t = -2., 3., .4
print("Absolute value:", abs(t*a+(1-t)*b), t*abs(a)+(1-t)*abs(b))
count = lambda x: float(x != 0)
print("L0 counterexample:", count(.5), .5*count(0)+.5*count(1))
```

**A Replacement That Makes the Search Easier**

This is why we sometimes replace difficult counting with a convex measurement, calling the replacement a convex relaxation. It creates a new problem; it does not prove that the new solution equals the old one.

On the bounded interval [−M, M], |w|/M is the largest convex function below the nonzero indicator: its convex envelope. Between zero and M, a convex lower bound cannot rise above the line joining $(0, 0)$ and (M, 1); scaled absolute value attains that line, and the negative side works similarly.

On a box bounding every entry, the envelope is $L_{1}$/M. On the whole unbounded space it is zero, rather than $L_{1}$.

Even a small example gives different solutions: a=0.6 and $\lambda=0.3$ make $L_{0}$ choose zero while $L_{1}$ chooses 0.3. Their relationship is not equality.

<!-- visual:l1-convex-envelope -->

$$
\operatorname{conv\,env}_{[-M,M]^d}(\|w\|_0)=\frac{\|w\|_1}{M},\qquad M>0.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### The envelope is not the original function

A convex envelope is the largest convex function lying below the function being approximated. The box [−M, M]^d bounds each entry’s magnitude by M>0.

The result identifies the envelope of the nonzero count on that box with total absolute magnitude divided by M; it does not equate the count itself with this quantity.

#### From one interval to a box

In one dimension, the lines joining $(0,0)$ to (M,1) and (−M,1) give |w|/M. Convexity prevents a lower bound from rising above these lines.

The box is a product of independent intervals and counting is additive, so the coordinate envelopes add.

#### Why M matters

For M=2 and w=0.5, the envelope costs 0.25 whereas counting costs 1. Without bounds, slopes 1/M can approach zero, and the global envelope is zero.

Identifying $L_{1}$ with an $L_{0}$ convex envelope therefore requires a specified bounded domain.

</details>

```python
M = 2.
grid = np.linspace(-M, M, 501)
indicator = (grid != 0).astype(float)
envelope = np.abs(grid)/M
print("Lower bound:", np.all(envelope <= indicator+1e-12))
print("L0 / L1 solutions:", hard_solution, max(.6-.3, 0))
```

**When the Solution Touches a Corner**

We can see the replacement’s effect before differentiating it. Give two coefficients an $L_{1}$ budget t: the allowed region is a diamond with vertices on the axes.

Equal-loss contours are ellipses for a positive-definite quadratic loss. We seek the smallest loss contour touching the allowed region, and contact at a vertex makes one coefficient zero.

In the following example, the unconstrained solution is $(2, 0.3)$. A budget of 1.2 gives the $L_{1}$ solution (1.2, 0), whereas $L_{2}$ gives approximately (1.1792, 0.2225).

Yet a diamond has edges too, and an optimum on an edge can have two nonzero coefficients. Under suitable Lagrangian conditions, a budget can be related to a penalty $\lambda$, but there is no universal fixed conversion between t and $\lambda$.

<!-- visual:l1-constraint-geometry -->

$$
F(\beta)=\frac12[(\beta_1-2)^2+2(\beta_2-0.3)^2],\qquad \min_{\|\beta\|_1\le t}F(\beta).
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### What does the loss describe?

The coefficients β₁ and β₂ specify a point to find. Without constraints, $(2,0.3)$ makes both squared errors vanish.

The factor 2 makes displacement in the second direction more expensive. The condition ‖β‖₁≤t permits points whose total coefficient magnitude fits budget t.

#### Why (1.2,0)?

With t=1.2, the unconstrained point is infeasible because it needs 2.3. At (1.2,0), the loss gradient is (−0.8,−0.6).

A constraint price of 0.8 balances the first active coefficient and allows the second to remain zero because its pressure 0.6 is below that price. This makes the corner optimal here.

#### The shape also has edges

Other data preferences can put the optimum on an edge with both coefficients nonzero. A budget specifies feasibility; $\lambda$ in a penalty specifies price.

Their relationship depends on the loss and solution rather than a universal conversion.

</details>

```python
from scipy.optimize import brentq
t = 1.2
lagrange_l1 = brentq(lambda z: max(2-z, 0)+max(.3-z/2, 0)-t, 0, 3)
l1_point = np.array([max(2-lagrange_l1, 0), max(.3-lagrange_l1/2, 0)])
lagrange_l2 = brentq(lambda z: np.hypot(2/(1+z), .6/(2+z))-t, 0, 10)
l2_point = np.array([2/(1+lagrange_l2), .6/(2+lagrange_l2)])
print(l1_point, l2_point)
```

**Why Does a Model Need Regularization?**

Why impose a budget or penalty at all? A model learns from examples it has seen, but we want it to perform on unseen examples.

It may memorize training details and noise, leading to overfitting. The average observed loss is empirical risk; population risk is expected loss under the distribution of future examples.

Regularization adds a preference $\Omega$ to fitting quality, with $\lambda$ setting its price. If model A has loss 0.20 and magnitude 10, while B has loss 0.23 and magnitude 2, then $\lambda=0.01$ gives objectives 0.30 and 0.25, favoring B.

Sacrificing some training fit may improve generalization, but does not guarantee it. Loss, regularizer, weighted penalty, and the full objective need to remain distinguishable.

$$
\widehat R_n(\theta)=\frac1n\sum_{i=1}^{n}\ell(y_i,f_\theta(x_i)),\qquad R(\theta)=\mathbb E[\ell(Y,f_\theta(X))],\qquad J_\lambda=\widehat R_n+\lambda\Omega.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### What do we observe and what do we want?

Parameters $\theta$ define fθ, and each observed pair (xᵢ,yᵢ) supplies a loss ℓ comparing response with prediction. Empirical risk adds these losses and divides by n.

Population risk instead averages loss over a fresh random pair (X,Y), so it is not directly available from training.

#### Pay for a preference

Add a chosen preference $\Omega$($\theta$), weighted by $\lambda$. If two models have losses 0.20 and 0.23 and magnitudes 10 and 2, $\lambda=0.01$ gives totals 0.30 and 0.25.

The second wins under the regularized objective despite its slightly worse fitting loss.

#### An objective is not a future-performance certificate

We minimize a training-computable quantity with our chosen preference. A lower regularized objective does not guarantee lower population risk: the preference may be unsuitable or $\lambda$ excessive.

Independent evaluation remains necessary.

</details>

```python
loss = np.array([.20, .23])
magnitude = np.array([10., 2.])
print(loss + .01*magnitude)  # [0.30, 0.25]
```

**The Price of Magnitude: $\lambda$**

When $\Omega$ is $L_{1}$, we charge the combined magnitudes of the coefficients we choose to regularize, which need not be every model parameter. We may exclude an intercept or some biases, so a strong penalty does not necessarily make the whole model zero. $\lambda$ is distinct from learning rate $\eta$, pruning threshold $\tau$, and stopping tolerance: they change the preference, the search step, a later removal decision, and numerical accuracy respectively.

Its effective price also depends on units and loss normalization. Multiplying both mean loss and penalty by n preserves the solution; changing the mean to a sum without scaling the penalty changes its strength.

For centered squared-error Lasso, λmax is the largest absolute column–response correlation divided by n, at which all slope coefficients can be zero. The two printed values agree because the penalty is also multiplied by the observation count; leaving $\lambda$ unchanged when switching from a mean to a sum changes the problem.

<!-- visual:l1-regularization-path -->

$$
J_\lambda(\theta)=F(\theta)+\lambda\sum_{j\in P}|\theta_j|,\qquad \lambda_{\max}=\left\|\frac{X^Ty}{n}\right\|_\infty.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Which parameters are charged?

The set P identifies penalized parameters; slopes may be included while the intercept is exempt. F measures fitting loss, and $\lambda$ prices each unit of absolute magnitude.

Switching from mean to summed loss also requires multiplying $\lambda$ by n to preserve the same problem.

#### Where does λmax come from?

For Lasso loss ‖y−Xβ‖₂²/(2n), the residual at $\beta=0$ is y and the loss gradient is −Xᵀy/n. Zero can balance this gradient when every column–response correlation has magnitude at most λ.

Taking the largest magnitude gives the displayed infinity norm.

#### Which zero do we mean?

With centered X and y and a separate unpenalized intercept, $\lambda$≥λmax makes all slopes zero. Predictions can still equal the training response mean.

Feature units and loss normalization change λmax, so it is not a universal tuning recommendation.

</details>

```python
losses = np.array([.4, .2, .3]); penalty, lam = 2., .05
print(len(losses)*(losses.mean()+lam*penalty),
      losses.sum()+len(losses)*lam*penalty)
```

**Data We Can Recreate**

Let us examine data we can reproduce, using the research report’s synthetic example. x2 is strongly correlated with x1, x3 is noise, and the response depends on x1 plus additional noise. Each row of X is an observation, each column a predictor, and y is what we want to predict.

Fix the seeds to repeat the experiment. Learn column means and scales from training alone, then apply them to an independent reference sample; subtract the training response mean to fit slopes without penalizing an intercept.

These numbers are for teaching. In an actual study, the reference sample should not become data used repeatedly to tune the model.

```python
def make_data(n, seed):
    rng = np.random.default_rng(seed)
    x1 = rng.normal(size=n)
    x2 = .985*x1 + np.sqrt(1-.985**2)*rng.normal(size=n)
    x3 = rng.normal(size=n)
    return np.column_stack([x1, x2, x3]), 2*x1+.6*rng.normal(size=n)
Xraw, yraw = make_data(180, 12)
Xtest_raw, ytest = make_data(800, 31)
mu, scale, ybar = Xraw.mean(0), Xraw.std(0), yraw.mean()
X, y = (Xraw-mu)/scale, yraw-ybar
Xtest = (Xtest_raw-mu)/scale
```

**From Least Squares to Ridge and Lasso**

Ordinary least squares, OLS, seeks $\beta$ making Xβ close to y. Differentiation gives the normal equations; independent columns allow an inverse formula, but in practice a stable numerical least-squares solver is preferable, and dependent columns can give nonunique coefficients.

Ridge adds half $\lambda$ times squared $L_{2}$, shrinking weakly determined directions; Lasso adds $\lambda L_{1}$ and can set some coefficients to zero. Our data give approximately (2.0563, −0.1672, −0.0386) for OLS, (1.0626, 0.7356, −0.0325) for Ridge at 0.10, and (1.8211, 0, 0) for Lasso at 0.07.

Reference errors are close: 0.3862, 0.4051, and 0.3869. Different coefficient allocations need not mean substantially different predictions.

The code leaves solver details to the library so the comparison stays clear; we will unpack thresholding shortly. To see when every coefficient disappears, try multiples of λmax; at and above it, only the mean response remains in this centered model.

<!-- visual:l1-regression-comparison -->

$$
\widehat\beta_{\rm OLS}\in\arg\min_\beta\frac{\|y-X\beta\|_2^2}{2n},\quad \widehat\beta_R=(X^TX+n\lambda I)^{-1}X^Ty,\quad \widehat\beta_L\in\arg\min_\beta\left\{\frac{\|y-X\beta\|_2^2}{2n}+\lambda\|\beta\|_1\right\}.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Read the dimensions

X has n observation rows and d predictor columns; $\beta$ has d entries, so Xβ gives n predictions to compare with y. Squared $L_{2}$ residual norm is the sum of squared errors.

Dividing by 2n gives an averaged loss with a convenient derivative. The argmin symbol denotes minimizing coefficient values rather than the minimum loss itself, and may describe multiple solutions.

#### Why add nλ to the matrix?

Ridge loss has gradient Xᵀ(Xβ−y)/n and its penalty has gradient λβ. Set their sum to zero and multiply by n to obtain (XᵀX+nλI)$\beta$=Xᵀy.

For $\lambda$>0 the matrix is invertible even with dependent columns; solve the linear system rather than explicitly forming its inverse.

#### The distinction at zero

OLS fits without a penalty, Ridge adds a quadratic price, and Lasso a linear magnitude price. Lasso’s corner allows exact zeros and requires more than an ordinary derivative at zero.

Here data are centered and the intercept is handled separately; comparisons must preserve data and loss normalization.

</details>

```python
from sklearn.linear_model import Lasso
beta_ols = np.linalg.lstsq(X, y, rcond=None)[0]
beta_ridge = np.linalg.solve(X.T@X+len(y)*.10*np.eye(3), X.T@y)
beta_lasso = Lasso(alpha=.07, fit_intercept=False,
                   tol=1e-10, max_iter=50000).fit(X, y).coef_
for name, beta in [("OLS", beta_ols), ("Ridge", beta_ridge), ("Lasso", beta_lasso)]:
    error = np.mean((ytest-ybar-Xtest@beta)**2)
    print(name, np.round(beta, 4), "test MSE:", round(error, 4))
```

```python
lambda_max = np.max(np.abs(X.T@y))/len(y)
for ratio in [.1, .5, 1., 1.2]:
    b = Lasso(alpha=ratio*lambda_max, fit_intercept=False,
              tol=1e-10, max_iter=50000).fit(X, y).coef_
    print("lambda/lambda_max:", ratio, "active:", np.count_nonzero(np.abs(b)>1e-8))
```

**How Does Zero Become a Solution?**

The absolute-value corner is what makes zero possible. Solve the one-number problem so the idea does not hide inside matrices: minimize (w−a)²/2+λ|w|, where a is the value preferred by the data alone.

If w is positive, the derivative is w−a+$\lambda$, giving a−$\lambda$ when a>$\lambda$. If w is negative, the derivative is w−a−$\lambda$, giving a+$\lambda$ when a<−$\lambda$.

At zero there is no single derivative, but there is a set of supporting slopes [−1, 1], the convex subdifferential. Zero is optimal exactly when |a|≤λ.

Soft-thresholding therefore removes values inside this interval and subtracts $\lambda$ from the magnitudes that survive. Ridge instead gives a/(1+$\lambda$), ordinarily shrinking a nonzero value without removing it at finite $\lambda$.

<!-- visual:l1-soft-threshold -->

$$
\partial|w|\big|_{w=0}=[-1,1],\qquad 0\in-a+\lambda[-1,1],\qquad S_\lambda(a)=\operatorname{sign}(a)(|a|-\lambda)_+,\quad (x)_+=\max(x,0).
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### More than one supporting slope

The ∂ symbol denotes a convex subdifferential. At w=0, each g between −1 and 1 defines a line gw lying below |w| and passing through zero, giving the set [−1,1].

These are supporting slopes satisfying a definition, rather than arbitrary ordinary derivatives.

#### How can the set contain zero?

The fitting-loss derivative at zero is −a. Zero is optimal if a g in [−1,1] satisfies −a+λg=0.

For λ>0 this requires g=a/λ, allowed exactly when |a|≤λ. If $\lambda=0$, the unregularized solution is w=a.

#### Combine the cases

For a>$\lambda$ the solution is a−$\lambda$; for a<−$\lambda$ it is a+$\lambda$; between them it is zero. The positive-part operation keeps max(x,0), and sign restores direction.

Thus a=2 and $\lambda=0.8$ give 1.2, whereas a=0.5 gives zero. The boundary |a|=λ also gives zero.

</details>

```python
def soft(v, threshold):
    return np.sign(v) * np.maximum(np.abs(v)-threshold, 0.0)
a = np.array([-2., -.5, 0., .5, 2.]); lam = .8
print("OLS:", a)
print("Ridge:", a/(1+lam))
print("Lasso:", soft(a, lam))
```

**The Balance at the Solution**

Returning to a vector, we examine each coefficient’s relationship with the residual r=y−Xβ after joint fitting. The KKT conditions say that a column’s residual correlation equals $\lambda$ times the sign of its nonzero coefficient; for a zero coefficient, the correlation may lie anywhere in [−$\lambda$, $\lambda$].

This balances fitting pressure against penalty pressure and certifies optimality for the convex problem. Coordinate descent isolates the current column’s effect, forms its partial residual, and computes correlation c_j and average squared column magnitude q_j.

The update is Sλ(c_j)/q_j. The solver does not guess a zero: the thresholding subproblem creates it.

A printed value near zero means the balance conditions hold numerically; it does not by itself tell us how the model will perform on new data.

$$
\frac{x_j^Tr}{n}=\lambda\operatorname{sign}(\widehat\beta_j)\ (\widehat\beta_j\ne0),\qquad \left|\frac{x_j^Tr}{n}\right|\le\lambda\ (\widehat\beta_j=0),\qquad \beta_j\leftarrow\frac{S_\lambda(c_j)}{q_j}.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Pressure left by the residual

At a solution r=y−Xβ̂, column xⱼ contains predictor j’s observations. The quantity xⱼᵀr/n is its residual association under our normalization, not a standardized Pearson correlation.

The fitting gradient is its negative and must balance the penalty subgradient.

#### Active versus zero

For a nonzero coefficient, absolute value has slope sign($\beta$̂ⱼ), giving equality with $\lambda$ times that sign. At zero the allowable slopes span [−1,1], so association magnitude need only be ≤$\lambda$.

All-coordinate conditions certify convex Lasso optimality, not performance on new data.

#### Update one coordinate

Add the current column’s contribution back to the residual to form a partial residual. Set cⱼ=xⱼᵀr_partial/n and qⱼ=xⱼᵀxⱼ/n.

The scalar quadratic is qⱼβⱼ²/2−cⱼβⱼ; adding λ|βⱼ| gives Sλ(cⱼ)/qⱼ for qⱼ>0. If cⱼ=0.2 and $\lambda=0.3$, the update is zero regardless of positive qⱼ.

</details>

```python
r = y-X@beta_lasso
corr = X.T@r/len(y)
active = np.abs(beta_lasso) > 1e-8
violations = np.where(active, np.abs(corr-.07*np.sign(beta_lasso)),
                      np.maximum(np.abs(corr)-.07, 0))
print("Largest KKT violation:", violations.max())
```

**A Step That Reaches Zero**

Following a slope directly may jump across the corner instead of landing on it. For |w|, starting at 0.03 with step 0.1 can alternate between 0.03 and −0.07.

Proximal gradient separates movement that reduces the smooth loss from handling the penalty: take a gradient step, then apply threshold ηλ. In the example below, (0.04, −0.20, 0) first becomes (0.03, −0.15, 0.06), then $(0, -0.11, 0.02)$.

One entry disappears, another shrinks, and a previously zero entry returns. Zero is not permanent when the fitting gradient changes.

For a smooth convex loss with L-Lipschitz gradient, the usual condition 0<$\eta\le 1$/L supports the appropriate convergence results.

$$
w^{(k+1)}=S_{\eta\lambda}\left(w^{(k)}-\eta\nabla F(w^{(k)})\right).
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Fit, then handle the penalty

The index k counts iterations, ∇F is the smooth-loss gradient, and $\eta$ is the step size. First compute v=w⁽ᵏ⁾−$\eta$∇F(w⁽ᵏ⁾), a movement intended to reduce F.

Then solve a proximal problem balancing proximity to v against magnitude cost. Its $L_{1}$ solution is soft thresholding at ηλ.

#### Why ηλ instead of $\lambda$?

The proximal objective is ‖w−v‖₂²/(2η)+λ‖w‖₁. Multiplying by η preserves the solution and gives threshold ηλ.

With $\eta=0.1$ and $\lambda=0.4$, the threshold is 0.04 and (0.03,−0.15,0.06) becomes $(0,-0.11,0.02)$.

#### Zero is not the end

A later fitting gradient may push a zero entry outside the threshold interval and reactivate it. Convergence needs assumptions on F and the step size; for convex F with L-Lipschitz gradient, 0<$\eta\le 1$/L is a usual choice.

This update does not grant a nonconvex network a global-minimum certificate.

</details>

```python
weights = np.array([.04, -.20, 0.])
gradient = np.array([.10, -.50, -.60])
intermediate = weights-.1*gradient
print(intermediate, "->", soft(intermediate, .1*.4))
```

**How Accurate Is the Solution?**

After finding a solution, we need to know its numerical accuracy, a different question from prediction quality. In squared-error Lasso, a feasible dual value provides a lower bound for the original optimum; the primal–dual gap bounds remaining objective error.

The code builds a feasible dual vector from the residual and calculates that gap. Approaching zero means approaching the solution of this optimization problem, without certifying prediction quality.

Here both objectives approach approximately 0.3200; rounding can leave a tiny difference. The gap can also support safe screening of columns, but here we stay with our first question: has the numerical search finished?

<!-- visual:l1-optimization-gap -->

```python
lam, n = .07, len(y)
r = y-X@beta_lasso
u = r/max(1., np.max(np.abs(X.T@r))/(n*lam))
primal = r@r/(2*n)+lam*np.abs(beta_lasso).sum()
dual = y@u/n-u@u/(2*n)
print("Primal / dual:", primal, dual)
print("Gap:", primal-dual)  # Near zero; tiny rounding errors are possible.
```

**Choosing $\lambda$**

Even an accurate solution can use an unsuitable $\lambda$, so choose regularization strength with observations kept out of fitting. Cross-validation divides training into folds, fits on some and evaluates on the rest.

Standardization must be learned within each training fold to prevent validation information leaking into preprocessing. Pipeline joins the steps and GridSearchCV searches $\lambda$, which Lasso calls alpha under the same normalization used here.

This example selects about 0.0297, but that number is not a general recommendation. If we estimate performance after tuning without an independent test sample, an outer evaluation such as nested validation is needed.

Temporal or grouped data need splits respecting their time or group structure.

```python
from sklearn.linear_model import Lasso
from sklearn.model_selection import GridSearchCV, KFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
procedure = Pipeline([("scale", StandardScaler()),
                      ("fit", Lasso(max_iter=50000, tol=1e-10))])
search = GridSearchCV(procedure,
    {"fit__alpha": np.geomspace(.003, .5, 30)},
    scoring="neg_mean_squared_error", cv=KFold(5, shuffle=True, random_state=20))
search.fit(Xraw, yraw)
print(search.best_params_, np.mean((ytest-search.predict(Xtest_raw))**2))
```

**Between Bias and Variance**

Regularization’s statistical effect is not exhausted by counting zeros. Bias is the difference between an estimator’s mean over hypothetical samples and the true value; variance describes its changes across those samples.

Coefficient mean squared error combines squared bias and variance. We may accept bias to reduce variance, but excessive regularization increases error.

If a has mean 2 and variance 1, Ridge at $\lambda=0.25$ gives bias −0.4 and variance 0.64, reducing MSE from 1 to 0.8; at $\lambda=3$ it rises to 2.3125. With correlated columns, different coefficients may give nearly identical predictions.

Even Ridge flexibility is not simply its coefficient count: in the centered formulation, it is the sum of d_$k^{2}$/(d_$k^{2}$+nλ) over singular directions.

$$
\mathbb E[(\widehat\beta-\beta^\star)^2]=\operatorname{Bias}(\widehat\beta)^2+\operatorname{Var}(\widehat\beta),\qquad \operatorname{df}_{R}=\sum_k\frac{d_k^2}{d_k^2+n\lambda}.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Estimation error across samples

The value $\beta$★ is the true coefficient, while $\beta$̂ varies across training samples. Split $\beta$̂−$\beta$★ into ($\beta$̂−Eβ̂)+(Eβ̂−$\beta$★), square, and take expectation.

The cross term vanishes because E($\beta$̂−Eβ̂)=0, leaving variance plus squared bias. This is coefficient-estimation error; full prediction error can also include response noise.

#### Accept bias when more is saved

An unregularized estimator with mean 2 and variance 1, shrunk by 1/(1+0.25)=0.8, has bias −0.4 and variance 0.64. Its MSE is 0.16+0.64=0.8 instead of 1.

Excessive shrinkage can make squared bias exceed the variance saved.

#### Ridge flexibility by direction

The dₖ are singular values of centered X, not the predictor count. Each direction contributes $d_{k}²$/($d_{k}²$+nλ), between 0 and 1 for $\lambda$>0.

Their sum gives fitted degrees of freedom excluding the intercept. Strong directions retain more flexibility.

At $\lambda=0$ use the limit on nonzero directions rather than a 0/0 expression.

</details>

```python
for lam in [.25, 3.]:
    bias = 2/(1+lam)-2
    variance = 1/(1+lam)**2
    print(lam, bias, variance, bias*bias+variance)
d = np.linalg.svd(X, compute_uv=False)
print("Ridge effective degrees of freedom:", np.sum(d*d/(d*d+len(y)*.10)))
```

**Did We Choose the Right Variable?**

Recovering the true support is a third question, separate from prediction and coefficient estimation. A correlated predictor may replace a signal-generating predictor with little predictive loss, so a sparse support is not proof of the correct support, still less of causality.

Support-recovery theory requires conditions on the design, noise, sample size, signal strength, and tuning, including limits on how inactive predictors imitate active ones. We can inspect stability by refitting on subsamples and counting how often each variable is selected.

Frequencies around (1.000, 0.204, 0.188) over 250 half-samples illustrate the signal, proxy, and noise distinction, but are not Bayesian inclusion probabilities. Formal stability-selection guarantees require additional assumptions.

Ordinary confidence intervals after data-driven variable selection may also mislead unless the selection effect is addressed.

<!-- visual:l1-selection-stability -->

```python
rng = np.random.default_rng(2026)
selected = []
for _ in range(250):
    idx = rng.choice(len(yraw), len(yraw)//2, replace=False)
    xs, ys = Xraw[idx], yraw[idx]
    xs = (xs-xs.mean(0))/xs.std(0)
    fit = Lasso(alpha=.07, fit_intercept=False, tol=1e-10, max_iter=50000)
    selected.append(np.abs(fit.fit(xs, ys-ys.mean()).coef_) > 1e-8)
selection_frequency = np.mean(selected, axis=0)
print(selection_frequency)
```

**Sparsity in the Representation**

Sparsity need not live in the original numbers. A sound recording may have almost no zero samples yet contain only a few frequencies.

Write x=Da, where the columns of D are dictionary atoms and a gives their contributions: sparsity may lie in a. More atoms than signal dimensions make the dictionary overcomplete and representations potentially nonunique.

Basis Pursuit seeks the smallest $L_{1}$ among representations satisfying the measurements, which differs from asking for the fewest atoms. The code expresses each coefficient as the difference of two nonnegative parts, turning absolute-value minimization into a linear program.

It recovers $(1, 0, 0)$ in the favorable example; one success is not a guarantee for every dictionary.

$$
\min_a\|a\|_1\quad\text{subject to}\quad Da=x.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Signal, atoms, and coefficients

The signal x contains samples, columns of D are dictionary atoms, and a gives each atom’s contribution. Multiplying Da combines those atoms.

More atoms than signal dimensions can permit multiple representations, requiring a criterion to choose among them.

#### Fitting is an exact constraint

Subject to means the reconstruction must equal x; among feasible representations we minimize ‖a‖₁. In the supplied dictionary, $(1,0,0)$ produces $(1,0)$, while $(0,-1,1)$ produces the same signal with magnitude cost 2 rather than 1.

#### A linear-programming reading

Write each aⱼ=aⱼ⁺−aⱼ⁻ with nonnegative parts and minimize their sum subject to D(a⁺−a⁻)=x. A minimum-cost solution need not keep both parts positive for the same entry, so their total realizes absolute value.

This minimizes $L_{1}$ magnitude, not necessarily the number of atoms in every dictionary.

</details>

```python
from scipy.optimize import linprog
def basis_pursuit(A, b):
    p = A.shape[1]
    result = linprog(np.ones(2*p), A_eq=np.hstack([A, -A]),
                     b_eq=b, bounds=(0, None), method="highs")
    if not result.success:
        raise RuntimeError(result.message)
    return result.x[:p]-result.x[p:]
A_good = np.array([[1., 0., 1.], [0., 1., 1.]])
x_true = np.array([1., 0., 0.])
good_recovery = basis_pursuit(A_good, A_good@x_true)
print(good_recovery)
```

**What the Measurements Cannot See**

Compressed sensing measures y=Ax using fewer measurements than unknowns. Any h satisfying Ah=0 is invisible to the measurements, making x+h an alternative explanation; these directions form the null space.

For $L_{1}$ to recover every signal with at most s active entries, the null-space property is necessary and sufficient: for every nonzero h in the null space and every set S of at most s positions, its $L_{1}$ magnitude inside S must be smaller than outside S. If x is supported in S, the reverse triangle inequality gives the chain below, making every alternative more expensive.

In the favorable example, alternatives are (1−t, −t, t), with minimum cost at t=0. But A=[1, 2] and y=1 favor $(0, 0.5)$ over $(1, 0)$, although both are one-sparse.

Sparsity alone cannot replace missing information or correct unequal column prices. Notice that the measurement is unchanged while $L_{1}$ cost falls from 1 to 0.5; that is why the solver chooses the alternative.

<!-- visual:l1-recovery-failure -->

$$
\|h_S\|_1<\|h_{S^c}\|_1\quad\Longrightarrow\quad \|x+h\|_1\ge\|x\|_1-\|h_S\|_1+\|h_{S^c}\|_1>\|x\|_1.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### What measurements cannot see

Assume x has support S, the positions of its nonzero entries, and nonzero h lies in the null space: Ah=0. Then x+h has identical measurements.

The complement Sᶜ contains positions outside the support, splitting h into hS and hSᶜ.

#### Read the inequality step by step

On S, the reverse triangle inequality gives ‖xS+hS‖₁≥‖xS‖₁−‖hS‖₁. Outside S, x is zero, so the whole quantity ‖hSᶜ‖₁ is added.

If that increase exceeds the amount h can remove inside S, the alternative costs more than x.

#### Every alternative matters

Checking one h does not establish recovery. To recover every signal supported on S, require the strict inequality for every nonzero null-space h.

For A=$(1,2)$, x=$(1,0)$, and h=$(-1,0.5)$, the alternative is $(0,0.5)$; the condition fails because 1 is not less than 0.5.

</details>

```python
A_bad = np.array([[1., 2.]])
truth = np.array([1., 0.])
alternative = basis_pursuit(A_bad, A_bad@truth)
print("Same measurement:", A_bad@truth, A_bad@alternative)
print("True / recovered:", truth, alternative)
print("L1 costs:", np.abs(truth).sum(), np.abs(alternative).sum())
```

**When Noise Enters**

With noise, we allow a measurement residual up to ε rather than demanding an exact match, as in Basis Pursuit Denoising. Under suitable conditions, such as a robust null-space property or restricted isometry approximately preserving sparse-vector lengths, reconstruction error can be controlled by noise and the tail of the best sparse approximation. σ_s(a)_1 is the smallest $L_{1}$ error after retaining the s largest magnitudes.

A large tail or unsuitable measurements removes the same justification. The code calculates this tail; it does not verify the theorem’s assumptions or determine its constants.

$$
\min_a\|a\|_1\ \text{subject to}\ \|Aa-y\|_2\le\epsilon,\qquad \|\widehat a-a\|_2\le C\epsilon+D\frac{\sigma_s(a)_1}{\sqrt{s}}.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Leave room for noise

In y=Aa+e, e denotes measurement error. A bound ‖e‖₂≤ε motivates allowing residual norm at most ε instead of forcing a fit to noise.

Here a is the signal coefficient vector, â the recovered solution, and s the number of entries retained by the best sparse approximation.

#### Two sources of recovery error

The term Cε accounts for noise; Dσs(a)₁/√s accounts for the tail discarded by the best s-entry approximation. Sum magnitudes outside the largest s entries to obtain σs(a)₁.

For $(3,-1,0.2,-0.1,0.05)$ with s=2, the tail is 0.35 and its normalized value is about 0.2475 before the constant multiplier.

#### Where do guarantees come from?

Existence and values of positive C and D depend on assumptions on A, such as a sufficiently strong restricted-isometry condition. They cannot be chosen arbitrarily to guarantee every matrix.

Under the required conditions, exact sparsity and zero noise make the right side zero, giving exact recovery.

</details>

```python
a = np.array([3., -1., .2, -.1, .05]); s = 2
tail = np.sort(np.abs(a))[::-1][s:].sum()
print("Best s-term L1 tail:", tail, "normalized:", tail/np.sqrt(s))
```

**Where Do We Put Absolute Value?**

In images, the location of absolute value changes the story. Penalizing Hu−y changes how measurement errors are treated; penalizing a in u=Da favors a sparse representation; penalizing neighboring differences favors similar regions.

For readings $(10, 11, 12, 250, 13)$, squared-error fitting chooses the mean 59.2 while absolute-error fitting chooses the median 12, reducing domination by the extreme observation. This does not make $L_{1}$ best for every noise process.

With an orthonormal dictionary, squared-error denoising plus $L_{1}$ on a reduces to thresholding Dᵀy and reconstructing D Sλ(Dᵀy). This simple formula does not automatically extend to redundant dictionaries or general operators.

Then enlarge only the outlier: the mean follows it, while the median stays at 12 in this sample.

```python
observations = np.array([10., 11., 12., 250., 13.])
print("Mean / median:", observations.mean(), np.median(observations))
D = np.array([[1., 1.], [1., -1.]])/np.sqrt(2)
image_row = np.array([10., 11.])
print("Transform denoising:", D@soft(D.T@image_row, .5))
```

```python
for outlier in [25., 250., 2500.]:
    sample = np.array([10., 11., 12., outlier, 13.])
    print(outlier, "mean:", sample.mean(), "median:", np.median(sample))
```

**The Image and Its Neighboring Differences**

Total variation, TV, measures how much neighbors differ, rather than their pixel intensities. The row $(10, 10, 10, 50, 50, 50)$ has no zero pixels, but differences $(0, 0, 40, 0, 0)$ are sparse.

Minimizing half the squared image error plus λTV encourages similar regions separated by fewer transitions. For two pixels, their mean stays unchanged and their difference becomes S₂λ(y2−y1): small differences disappear while a large edge may remain.

Full-image differences are coupled, so we cannot independently threshold every difference. Anisotropic TV sums |Dx u|+|Dy u|; isotropic TV sums the square roots of the squared components.

Too much TV can turn gradients into steps and erase fine texture. In a second experiment, increase $\lambda$ for the two pixels until their difference vanishes at 1.5; what disappears is the difference, not the pixels.

<!-- visual:l1-total-variation -->

$$
\operatorname{TV}(u)=\sum_{i=1}^{n-1}|u_{i+1}-u_i|,\qquad \min_u\frac12\|u-y\|_2^2+\lambda\operatorname{TV}(u).
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Measure changes between neighbors

Entries uᵢ form the signal being estimated, while y is observed. Each uᵢ₊₁−uᵢ measures a neighboring change; TV sums their magnitudes.

The row $(10,10,10,50,50,50)$ has one nonzero difference of 40, despite every entry being nonzero.

#### Balance two pixels

For y=$(10,13)$, the mean is 11.5. Let $\delta$ denote the estimated difference.

Fitting loss becomes (δ−3)²/4 and the penalty is λ|δ|, so δ̂=S₂λ(3). At $\lambda=1$ the difference is 1 and pixels are $(11,12)$; at $\lambda\ge 1.5$ both become 11.5.

Neither pixel was asked to become zero.

#### Region size changes the threshold

In the six-entry row, each region has three entries, giving difference max(40−2λ/3,0) and merging at $\lambda=60$. General-image differences share pixels and must reconstruct one consistent signal; independent thresholding of every difference is not generally a TV solution.

</details>

```python
row = np.array([10., 10., 10., 50., 50., 50.])
print("Differences:", np.diff(row), "TV:", np.abs(np.diff(row)).sum())
two_pixels, lam = np.array([10., 13.]), 1.
mean = two_pixels.mean()
delta = soft(two_pixels[1]-two_pixels[0], 2*lam)
print("Two-pixel TV result:", [mean-delta/2, mean+delta/2])
```

```python
for lam_tv in [0., .5, 1., 1.5, 2.]:
    difference = soft(13.-10., 2*lam_tv)
    pixels = np.array([11.5-difference/2, 11.5+difference/2])
    print(lam_tv, pixels, "difference:", np.diff(pixels)[0])
```

**Weights and Activations**

The idea enters neural networks once we specify what should become small. A neuron computes z=wᵀx+b and applies an activation; ReLU gives max(0, z).

A weight is a stored trainable number, whereas an activation is a response varying with the input, so a zero activation does not mean a deleted weight. The usual weight penalty sums absolute values of every selected matrix or tensor entry.

It is not the induced matrix one-norm, which takes the largest column sum. A zero connection does not remove an entire neuron while other connections remain.

The code distinguishes the two measurements and compares scattered zeros with a whole zero row; the figure lets us switch patterns.

<!-- visual:l1-weight-patterns -->

$$
z=w^Tx+b,\quad h=\max(0,z),\qquad \|W\|_{1,\mathrm{entry}}=\sum_{i,j}|W_{ij}|,\quad \|W\|_{1,\mathrm{induced}}=\max_j\sum_i|W_{ij}|.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### From weights to activation

For a neuron, x contains inputs, w its weights, and wᵀx sums input–weight products. Add bias b to obtain z; ReLU returns z when positive and zero when negative.

An activation can be zero for one input without the stored weights becoming zero.

#### Two quantities with the same label

Entrywise matrix $L_{1}$ adds every |Wᵢⱼ| as if flattening W into a vector. Induced $L_{1}$ measures the largest input-norm amplification under multiplication by W and equals the largest absolute column sum.

The shared numeral does not make the quantities identical.

#### Calculate the distinction

For rows $(1,0,-2)$ and $(0,0.5,0)$, entrywise magnitude is 3.5, while column sums are 1, 0.5, and 2, giving induced norm 2. Our neural-weight $L_{1}$ penalty uses the entrywise sum; naming the convention avoids confusing the two penalties.

</details>

```python
W = np.array([[1., 0., -2.], [0., .5, 0.]])
print("Entrywise / induced:", np.abs(W).sum(), np.linalg.norm(W, 1))
structured = W.copy(); structured[1] = 0
print("Scattered:", W, "Zero row:", structured)
```

**The Same Function with Different Weights**

If we regularize activations using their average $L_{1}$ across inputs, the penalty derivative reaches weights through the chain rule; we are no longer directly measuring stored weights. ReLU may respond to one input and switch off for another.

There is another reason not to read every small weight as low importance. In f(x)=b ReLU(ax), multiplying a by a positive c and dividing b by c preserves predictions while changing parameter magnitudes and their penalty.

Interpreting weights therefore requires the layers, units, and exclusions to be known. The example shows one function wearing different parameter magnitudes.

$$
\frac{\lambda}{n}\sum_i\|h_\theta(x_i)\|_1,\qquad b\operatorname{ReLU}(ax)=\frac bc\operatorname{ReLU}(cax)\quad(c>0).
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Penalize what a neuron does

The first term sums activation magnitudes hθ(xᵢ) across training examples and averages by n. It penalizes responses to those examples rather than weights directly.

A neuron may be silent for one input and active for another, so activation sparsity is different from weight sparsity.

#### Keep the function, change the weights

In this two-layer example, a multiplies the input before ReLU and b multiplies its output. For c>0, ReLU(cz)=cReLU(z); multiply the inner weight by c and divide the outer weight by c to preserve bReLU(ax).

#### The price is not preserved

With a=2 and b=3, total weight magnitude is 5. Taking c=4 changes weights to 8 and 0.75 and total magnitude to 8.75 without changing predictions.

Rescaling need not lower the penalty: it shows the penalty prices a particular function representation. Positivity of c is required for the identity.

</details>

```python
inputs = np.array([-2., 0., 1., 3.]); a, b, c = 2., 3., 4.
original = b*np.maximum(a*inputs, 0)
rescaled = (b/c)*np.maximum(c*a*inputs, 0)
print(np.allclose(original, rescaled), abs(a)+abs(b), abs(c*a)+abs(b/c))
```

**From a Connection to a Channel**

The goal may therefore be removal of entire groups, such as channels or filters, rather than individual connections. A group penalty adds $L_{2}$ lengths of predefined groups and can zero a whole group.

Channel-scale regularization instead penalizes $\gamma$ in h_c=γ_c ẑ_c+β_c. A zero $\gamma$ removes the input-dependent component, but $\beta$ may leave a constant contribution; downstream effects must be traced before deleting the channel.

The complete network loss generally remains nonconvex, and SGD or Adam with penalty subgradients does not guarantee exact zeros. Regularization, proximal optimization, and pruning are different operations.

This code is a numerical illustration of thresholding weights and maintaining a fixed mask through one refinement step, rather than a full network-training protocol.

```python
weights = np.array([.003, -.2, .07, -.0001])
tau = .01
mask = (np.abs(weights) > tau).astype(float)
pruned = weights*mask
gradient = np.array([1., -.4, .3, -1.])
refined = (pruned-.01*gradient)*mask
print("Pruned:", pruned, "fixed-mask refinement:", refined)
gamma, offset = 0., .3
print("Zero-scale channel:", gamma*np.array([-1., 2.])+offset)
```

**Has the Model Become Smaller and Faster?**

Distinguish four achievements that may hide beneath the word sparsity: small weights, actual zero weights, a smaller representation, and faster computation. The fraction with |w|≤τ is not the fraction of exact zeros, and a dense matrix keeps the same storage even when zeros multiply.

One million FP32 entries need 4,000,000 raw bytes. Keeping 100,000 entries in a 1000×1000 CSR matrix with 32-bit indices needs approximately 804,004 bytes for values, indices, and row pointers.

Sparse encoding may be larger at low sparsity, or slower because of indexing overhead. Removing 32 of 64 output channels from a 64×64×3×3 convolution reduces that layer from 36,864 to 18,432 weights once its shape is rebuilt; it does not prove a twofold model speedup.

Latency, throughput, and memory must be measured on the intended device.

<!-- visual:l1-sparse-storage -->

$$
s_0=\frac{\#\{j:w_j=0\}}{d},\qquad s_\tau=\frac{\#\{j:|w_j|\le\tau\}}{d}.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Exact zeros and decided zeros

The dimension d counts weights and # counts entries meeting the condition. s₀ counts actual zeros; sτ counts magnitudes at most $\tau\ge 0$, including small nonzeros. Dividing by d produces a fraction between 0 and 1, which can be multiplied by 100 for a percentage.

#### An example exposes the gap

Weights (0.003,−0.2,0.07,−0.0001) contain no exact zeros, so s₀=0. At $\tau=0.01$, two entries meet the threshold and s$\tau=0.5$.

Explicitly pruning those two then makes exact sparsity 0.5; the pre-pruning measurement differs from the operation’s result.

#### What the count does not tell us

Increasing $\tau$ raises the small-weight count without automatically improving the model. Zeros may remain in dense storage, sparse storage needs indices, and hardware may not exploit them.

Measure size, latency, and prediction quality separately from this fraction.

</details>

```python
print("Exact / threshold sparsity:", np.mean(weights == 0),
      np.mean(np.abs(weights) <= tau))
rows, cols, nnz = 1000, 1000, 100000
print("Dense / CSR bytes:", 4*rows*cols, 8*nnz+4*(rows+1))
print("Convolution weights:", 64*64*3*3, 32*64*3*3)
```

**When $L_{1}$ and $L_{2}$ Meet**

When one preference is insufficient, change the penalty to fit the need. Elastic Net combines $L_{1}$ with squared $L_{2}$.

In the following convention $\alpha=1$ returns Lasso and $\alpha=0$ returns Ridge. For identical predictors, (c, 0) and (c/2, c/2) have identical predictions and the same $L_{1}$ charge when c is positive, but the quadratic term prefers the balanced allocation.

In coordinate descent, thresholding stays in the numerator while $\lambda$(1−$\alpha$) enters the denominator to provide quadratic shrinkage. Here $\alpha$ is the mixing fraction; alpha in the earlier Lasso software was $\lambda$.

Recognizing the letter cannot replace reading its definition. Use two identical predictors in the next experiment: Lasso permits different allocations of the same total, while the quadratic term favors an equal split.

$$
\min_\beta\frac{\|y-X\beta\|_2^2}{2n}+\lambda\left[\alpha\|\beta\|_1+\frac{1-\alpha}{2}\|\beta\|_2^2\right],\qquad \beta_j\leftarrow\frac{S_{\lambda\alpha}(c_j)}{q_j+\lambda(1-\alpha)}.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Specify the mixture

Here $\alpha$ between 0 and 1 is the $L_{1}$ fraction and 1−$\alpha$ the quadratic fraction. At $\alpha=1$ we obtain Lasso; at $\alpha=0$, Ridge under this normalization. $\lambda\ge 0$ scales both.

Some sources define the mixture differently, so inspect the formula before transferring parameter names.

#### How does the coordinate update change?

The coordinate fitting term is qⱼβⱼ²/2−cⱼβⱼ. The quadratic penalty increases curvature by $\lambda$(1−$\alpha$), while the linear penalty sets threshold λα.

Threshold cⱼ and divide by qⱼ+$\lambda$(1−$\alpha$), assuming a positive denominator.

#### Why split identical predictors?

If prediction depends on the sum of two positive coefficients, $(2,0)$ and $(1,1)$ give the same sum and $L_{1}$. Their squared magnitudes differ: 4 versus 2.

The quadratic term favors sharing. This explains grouping without imposing predefined groups as Group Lasso does.

</details>

```python
lam, alpha, c = .3, .5, 2.
for beta in [np.array([c, 0.]), np.array([c/2, c/2])]:
    charge = lam*(alpha*np.abs(beta).sum()+(1-alpha)*(beta@beta)/2)
    print(beta, charge)
```

```python
from sklearn.linear_model import ElasticNet
z = np.array([-2., -1., 1., 2.])
duplicated = np.column_stack([z, z])
for mix in [1., .5]:
    fit = ElasticNet(alpha=.2, l1_ratio=mix, fit_intercept=False,
                     tol=1e-10, max_iter=50000).fit(duplicated, 2*z)
    print("L1 fraction:", mix, "coefficients:", np.round(fit.coef_, 4))
```

**Different Prices and Whole Groups**

Prices may also differ across coefficients. Weighted $L_{1}$ multiplies each magnitude by ω_j, while Adaptive Lasso derives those weights from an initial estimate, often (|β̃_j|+ε)^−γ.

Initially strong signals may receive less shrinkage, but a misleading initial estimate can mislead the weights, and oracle-property results are conditional. Group Lasso penalizes each group’s length; in its isolated proximal problem it multiplies the entire group by (1−λ/||a||2)+.

Sparse Group Lasso allows both group removal and zeros within surviving groups. For nonoverlapping groups in a Euclidean proximal subproblem, apply elementwise thresholding first and group shrinkage second.

The code illustrates the distinction without assuming that all groups are independent in a general fitting problem.

$$
\lambda\sum_j\omega_j|\beta_j|,\qquad \sum_g\lambda_g\|\beta_{G_g}\|_2,\qquad \operatorname{prox}_{\lambda\|\cdot\|_2}(a)=\left(1-\frac{\lambda}{\|a\|_2}\right)_+a.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Different prices for individuals

Nonnegative weights ωⱼ give coefficients different prices in λΣωⱼ|βⱼ|. If derived from preliminary estimates, small preliminary coefficients may receive larger prices.

For example 1/(|βⱼ_initial|+ε) avoids division by zero, but constructing estimates and prices is a methodological choice, not an automatic selection guarantee.

#### A group pays together

Group Gg contains coefficients whose Euclidean magnitude is penalized jointly at price λg. Group $L_{2}$ can remove the entire weak group, but does not force every small entry inside a surviving group to zero.

#### Move the group toward zero

The proximal map minimizes ‖w−a‖₂²/2+λ‖w‖₂. If ‖a‖₂≤λ, choose zero; otherwise preserve direction and reduce length by λ, giving factor 1−λ/‖a‖₂.

Define the result as zero at a=0 without dividing. This is a single-group proximal formula; overlapping groups require additional handling.

</details>

```python
initial = np.array([2., .2, .01])
print("Adaptive weights:", (np.abs(initial)+1e-3)**-1)
def group_shrink(a, threshold):
    norm = np.linalg.norm(a)
    return np.zeros_like(a) if norm == 0 else max(1-threshold/norm, 0)*a
a = np.array([.2, 2., -.1])
print("Group:", group_shrink(a, .8))
print("Sparse group:", group_shrink(soft(a, .3), .8))
```

**When Order Matters**

When order matters, Fused Lasso combines penalties on magnitudes and neighboring differences, favoring zeros and constant regions according to the two strengths. We can also constrain coefficients to be nonnegative when that suits the phenomenon; the scalar proximal threshold becomes max(a−$\lambda$, 0), not because negative values are inherently wrong.

Nonconvex penalties try to reduce shrinkage bias or change sparsity preferences, but give up some convex guarantees. Method choice begins with the meaning of groups, adjacency, signs, and the target, rather than a contest for the largest zero count.

$$
\lambda_1\sum_j|w_j|+\lambda_2\sum_{j=2}^{d}|w_j-w_{j-1}|.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Carry two prices

λ₁ prices values themselves and λ₂ prices each difference from the previous entry. The second sum starts at j=2 so a previous entry exists.

Ordering must be meaningful, such as time or pixel position; permuting entries may preserve the first penalty while changing the second.

#### What does a zero difference mean?

A zero difference means adjacent entries agree, not that either is zero. For $(0,0,2,2,2)$, total magnitude is 6 and total absolute difference 2.

With λ₁=0.1 and λ₂=0.4, the penalty is 0.6+0.8=1.4, separate from fitting loss omitted here.

#### Why solve jointly?

Each entry participates in its own magnitude and neighboring differences. Independently removing small differences does not generally solve the joint problem.

The penalty encourages constant pieces and possibly zero values; fitting loss and both prices determine the actual pieces.

</details>

```python
w = np.array([0., 0., 2., 2., 2.])
print("Fused penalty:", .1*np.abs(w).sum()+.4*np.abs(np.diff(w)).sum())
print("Nonnegative threshold:", np.maximum(np.array([-1., .2, 2.])-.5, 0))
```

**Simplicity in the Directions**

Simplicity may therefore lie in directions rather than entries. In SVD we write M=U diag(σ_i)Vᵀ.

The columns of U and V are orthonormal directions, and the singular values σ_i are their magnitudes. Rank counts nonzero singular values; the nuclear norm sums them.

A 2×2 all-ones matrix is dense but rank one, whereas the identity contains zeros and has rank two. Minimizing half the squared Frobenius error plus τ||W||* soft-thresholds singular values, removing directions and shrinking survivors.

This differs from truncated SVD, which keeps the largest k singular values unchanged. In our example, (3.1648, 0.3792) becomes (2.4648, 0) at $\tau=0.7$, reducing rank to one.

Computational savings still require suitable low-rank factors and execution rather than a same-sized stored matrix.

<!-- visual:l1-singular-shrinkage -->

$$
\|M\|_* =\sum_i\sigma_i,\qquad \min_W\frac12\|W-M\|_F^2+\tau\|W\|_*,\qquad \widehat W=U\operatorname{diag}((\sigma_i-\tau)_+)V^T.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### Simplicity in directions

Write M=UΣVᵀ with singular values $\sigmaᵢ\ge 0$. The nuclear norm sums them, whereas rank counts the nonzero ones.

Squared Frobenius error sums squared matrix-entry errors. Here W should stay close to M while paying price $\tau\ge 0$ for total singular magnitude.

#### From scalar to singular-value thresholds

For this quadratic Frobenius problem, orthogonal invariance allows the solution’s directions to align with U and V. Each singular value then solves (s−σᵢ)²/2+τs with s≥0, yielding max(σᵢ−$\tau$,0).

Reconstruct W using the new values and unchanged directions.

#### Shrinkage is not fixed-rank truncation

Values about 3.1648 and 0.3792 become 2.4648 and 0 at $\tau=0.7$, reducing rank to 1. Rank-1 truncated SVD instead keeps 3.1648 unchanged and removes the second value, solving a different problem with potentially smaller Frobenius error.

This threshold formula does not directly solve arbitrary matrix-measurement losses.

</details>

```python
M = np.array([[3., 1.], [0., .4]])
U, singular_values, Vt = np.linalg.svd(M, full_matrices=False)
shrunk = np.maximum(singular_values-.7, 0.)
M_low_rank = (U*shrunk)@Vt
print(singular_values, shrunk)
print(np.linalg.matrix_rank(M), np.linalg.matrix_rank(M_low_rank))
truncated = (U*np.array([singular_values[0], 0.]))@Vt
print("Nuclear / truncated error:", np.linalg.norm(M-M_low_rank),
      np.linalg.norm(M-truncated))
```

**A Probabilistic Reading of Regularization**

Regularization also has a probabilistic reading. Under suitable likelihood and normalization conventions, a Gaussian prior gives a quadratic penalty and independent Laplace priors give an absolute-value penalty for MAP estimation, the point of highest posterior density.

A sparse posterior mode does not mean that draws from the continuous posterior have positive probability of landing exactly at zero; a point mass there requires a different model, such as spike-and-slab. Not all regularization methods are norm penalties: early stopping chooses a point along a learning trajectory, dropout changes activations during training, and data augmentation encodes acceptable input transformations.

Their connection is the preference they introduce into learning, rather than one formula containing them all. In the code, compare the increase from 0 to 1 with the increase from 1 to 2: the quadratic penalty grows more, while absolute value increases by the same amount.

$$
p(\beta_j)\propto e^{-\beta_j^2/(2s^2)}\quad\text{or}\quad p(\beta_j)\propto e^{-|\beta_j|/b}.
$$

<details class="equation-detail">
<summary>Read this equation in detail</summary>

#### What does proportionality omit?

The ∝ symbol gives a density’s shape while omitting a normalization factor independent of βⱼ. Gaussian scale s>0 is its standard deviation; Laplace has scale b>0.

Both are centered at zero but price distance from it differently.

#### From a density to a penalty

Negative logarithms turn the exponentials into βⱼ²/($2s^{2}$) or |βⱼ|/b plus constants. Independent coefficient priors make these terms additive.

Add them to negative log likelihood for a MAP objective; determining $\lambda$ also requires noise scale and likelihood-loss normalization.

#### A peak is not a point mass

The MAP estimate can be exactly zero because of the penalty’s corner, while a continuous Laplace prior assigns zero probability to any single point, as Gaussian density does. MAP coefficients alone do not describe posterior uncertainty.

A sparse estimate and a complete probability distribution are different objects.

</details>

```python
values = np.array([0., 1., 2.])
gaussian_penalty = values**2/2
laplace_penalty = np.abs(values)
print("Gaussian penalty / increments:", gaussian_penalty, np.diff(gaussian_penalty))
print("Laplace penalty / increments:", laplace_penalty, np.diff(laplace_penalty))
```

**What Does the Result Establish?**

We still need to read a result within what it actually establishes. Multiply a predictor column by c and divide its coefficient by c to preserve predictions, and its $L_{1}$ price changes by 1/|c|; feature scale therefore affects selection.

Identical columns may give multiple Lasso coefficient allocations with identical predictions, and surviving coefficients remain shrunk, introducing bias. $L_{1}$ on weights does not automatically give the robustness of $L_{1}$ residual loss, and zero differences do not mean the same thing as zero pixels or channels.

State what was penalized, how loss and feature scales were handled, how the problem was solved and tuned, and what zero means. Then evaluate prediction, stability, size, and time separately.

The bird has chosen its branches, but the nest must still work; likewise, the word sparse is insufficient until we know why the solution became sparse and what it achieved. Turn the change of units into an actual fit: enlarge one of two orthogonal columns, then standardize them; the selection change here comes from the price of units.

```python
x = np.array([1., 2., 3.]); beta, c = 2., 10.
print("Same predictions:", np.allclose(x*beta, (c*x)*(beta/c)))
print("Different L1 charge:", abs(beta), abs(beta/c))
identical = np.column_stack([x, x])
print(np.allclose(identical@np.array([2., 0.]), identical@np.array([1., 1.])))
```

```python
orthogonal = np.array([[1., 1.], [1., -1.], [-1., 1.], [-1., -1.]])
target = .2*orthogonal.sum(axis=1)
for factor in [1., 10.]:
    scaled = orthogonal*np.array([1., factor])
    for standardize in [False, True]:
        design = scaled/scaled.std(0) if standardize else scaled
        b = Lasso(alpha=.3, fit_intercept=False, tol=1e-10).fit(design, target).coef_
        print(factor, "standardized:", standardize, "coefficients:", b)
```

**References**

The sources are listed in APA 7 style. DOI links point to the published records.

Beck, A., & Teboulle, M. (2009). A fast iterative shrinkage-thresholding algorithm for linear inverse problems. *SIAM Journal on Imaging Sciences, 2*(1), 183–202. [https://doi.org/10.1137/080716542](https://doi.org/10.1137/080716542)

Boyd, S. (n.d.). *ℓ1-norm methods for convex-cardinality problems* [Lecture slides]. Stanford University. [https://web.stanford.edu/class/ee364b/lectures/l1_methods_slides.pdf](https://web.stanford.edu/class/ee364b/lectures/l1_methods_slides.pdf)

Cai, J.-F., Candès, E. J., & Shen, Z. (2010). A singular value thresholding algorithm for matrix completion. *SIAM Journal on Optimization, 20*(4), 1956–1982. [https://doi.org/10.1137/080738970](https://doi.org/10.1137/080738970)

Candès, E. J., Romberg, J., & Tao, T. (2006). Robust uncertainty principles: Exact signal reconstruction from highly incomplete frequency information. *IEEE Transactions on Information Theory, 52*(2), 489–509. [https://doi.org/10.1109/TIT.2005.862083](https://doi.org/10.1109/TIT.2005.862083)

Chen, S. S., Donoho, D. L., & Saunders, M. A. (1998). Atomic decomposition by basis pursuit. *SIAM Journal on Scientific Computing, 20*(1), 33–61. [https://doi.org/10.1137/S1064827596304010](https://doi.org/10.1137/S1064827596304010)

Donoho, D. L. (2006). Compressed sensing. *IEEE Transactions on Information Theory, 52*(4), 1289–1306. [https://doi.org/10.1109/TIT.2006.871582](https://doi.org/10.1109/TIT.2006.871582)

Fercoq, O., Gramfort, A., & Salmon, J. (2015). Mind the duality gap: Safer rules for the Lasso. In F. Bach & D. Blei (Eds.), *Proceedings of the 32nd International Conference on Machine Learning* (Vol. 37, pp. 333–342). PMLR. [https://proceedings.mlr.press/v37/fercoq15.html](https://proceedings.mlr.press/v37/fercoq15.html)

Friedman, J., Hastie, T., & Tibshirani, R. (2010). Regularization paths for generalized linear models via coordinate descent. *Journal of Statistical Software, 33*(1), 1–22. [https://doi.org/10.18637/jss.v033.i01](https://doi.org/10.18637/jss.v033.i01)

Hoerl, A. E., & Kennard, R. W. (1970). Ridge regression: Biased estimation for nonorthogonal problems. *Technometrics, 12*(1), 55–67. [https://doi.org/10.1080/00401706.1970.10488634](https://doi.org/10.1080/00401706.1970.10488634)

Lee, J. D., Sun, D. L., Sun, Y., & Taylor, J. E. (2016). Exact post-selection inference, with application to the Lasso. *The Annals of Statistics, 44*(3), 907–927. [https://doi.org/10.1214/15-AOS1371](https://doi.org/10.1214/15-AOS1371)

Meinshausen, N., & Bühlmann, P. (2010). Stability selection. *Journal of the Royal Statistical Society: Series B (Statistical Methodology), 72*(4), 417–473. [https://doi.org/10.1111/j.1467-9868.2010.00740.x](https://doi.org/10.1111/j.1467-9868.2010.00740.x)

Parikh, N., & Boyd, S. (2014). Proximal algorithms. *Foundations and Trends in Optimization, 1*(3), 127–239. [https://doi.org/10.1561/2400000003](https://doi.org/10.1561/2400000003)

Scardapane, S., Comminiello, D., Hussain, A., & Uncini, A. (2017). Group sparse regularization for deep neural networks. *Neurocomputing, 241*, 81–89. [https://doi.org/10.1016/j.neucom.2017.02.029](https://doi.org/10.1016/j.neucom.2017.02.029)

Tibshirani, R. (1996). Regression shrinkage and selection via the Lasso. *Journal of the Royal Statistical Society: Series B (Methodological), 58*(1), 267–288. [https://doi.org/10.1111/j.2517-6161.1996.tb02080.x](https://doi.org/10.1111/j.2517-6161.1996.tb02080.x)

Wainwright, M. J. (2009). Sharp thresholds for high-dimensional and noisy sparsity recovery using ℓ1-constrained quadratic programming (Lasso). *IEEE Transactions on Information Theory, 55*(5), 2183–2202. [https://doi.org/10.1109/TIT.2009.2016018](https://doi.org/10.1109/TIT.2009.2016018)

Wen, W., Wu, C., Wang, Y., Chen, Y., & Li, H. (2016). Learning structured sparsity in deep neural networks. In D. D. Lee, M. Sugiyama, U. von Luxburg, I. Guyon, & R. Garnett (Eds.), *Advances in Neural Information Processing Systems 29* (pp. 2074–2082). Curran Associates. [https://proceedings.neurips.cc/paper/2016/hash/41bfd20a38bb1b0bec75acf0845530a7-Abstract.html](https://proceedings.neurips.cc/paper/2016/hash/41bfd20a38bb1b0bec75acf0845530a7-Abstract.html)

Williams, P. M. (1995). Bayesian regularization and pruning using a Laplace prior. *Neural Computation, 7*(1), 117–143. [https://doi.org/10.1162/neco.1995.7.1.117](https://doi.org/10.1162/neco.1995.7.1.117)

Yuan, M., & Lin, Y. (2006). Model selection and estimation in regression with grouped variables. *Journal of the Royal Statistical Society: Series B (Statistical Methodology), 68*(1), 49–67. [https://doi.org/10.1111/j.1467-9868.2005.00532.x](https://doi.org/10.1111/j.1467-9868.2005.00532.x)

Zhao, P., & Yu, B. (2006). On model selection consistency of Lasso. *Journal of Machine Learning Research, 7*, 2541–2563. [https://jmlr.org/papers/v7/zhao06a.html](https://jmlr.org/papers/v7/zhao06a.html)

Zou, H. (2006). The adaptive Lasso and its oracle properties. *Journal of the American Statistical Association, 101*(476), 1418–1429. [https://doi.org/10.1198/016214506000000735](https://doi.org/10.1198/016214506000000735)

Zou, H., & Hastie, T. (2005). Regularization and variable selection via the elastic net. *Journal of the Royal Statistical Society: Series B (Statistical Methodology), 67*(2), 301–320. [https://doi.org/10.1111/j.1467-9868.2005.00503.x](https://doi.org/10.1111/j.1467-9868.2005.00503.x)
