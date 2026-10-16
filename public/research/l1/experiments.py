"""Run all Markdown examples in reading order. Adapted from the supplied L1 research PDF, with teaching experiments."""
# Paragraph 2
import numpy as np
w = np.array([3., -4., 2.])
print(np.abs(w).sum())  # 9.0

# Paragraph 3
w = np.array([3., -2.])
u, v = np.array([2., -1.]), np.array([-1., 3.])
print(2*w, np.abs(2*w).sum(), 2*np.abs(w).sum())
print(np.abs(u+v).sum() <= np.abs(u).sum()+np.abs(v).sum())

# Paragraph 4
point = np.array([3., 2.])
print("Manhattan:", np.abs(point).sum())
print("Euclidean:", np.linalg.norm(point))

# Paragraph 5
w = np.array([3., 4., 0.])
print(np.count_nonzero(w), np.abs(w).sum(),
      np.linalg.norm(w), np.max(np.abs(w)))
a, b = np.array([1., 0., 0., 0.]), np.full(4, .25)
print(np.abs(a).sum(), np.abs(b).sum(),
      np.count_nonzero(a), np.count_nonzero(b))

# Paragraph 7
w = np.array([0., 4., 0., -2., 0., 0.])
print("Support, counted from 1:", np.flatnonzero(w)+1)
a, lam = .6, .3
hard_solution = 0. if a*a/2 <= lam else a
print("Hard threshold:", hard_solution)

# Paragraph 8
a, b, t = -2., 3., .4
print("Absolute value:", abs(t*a+(1-t)*b), t*abs(a)+(1-t)*abs(b))
count = lambda x: float(x != 0)
print("L0 counterexample:", count(.5), .5*count(0)+.5*count(1))

# Paragraph 9
M = 2.
grid = np.linspace(-M, M, 501)
indicator = (grid != 0).astype(float)
envelope = np.abs(grid)/M
print("Lower bound:", np.all(envelope <= indicator+1e-12))
print("L0 / L1 solutions:", hard_solution, max(.6-.3, 0))

# Paragraph 10
from scipy.optimize import brentq
t = 1.2
lagrange_l1 = brentq(lambda z: max(2-z, 0)+max(.3-z/2, 0)-t, 0, 3)
l1_point = np.array([max(2-lagrange_l1, 0), max(.3-lagrange_l1/2, 0)])
lagrange_l2 = brentq(lambda z: np.hypot(2/(1+z), .6/(2+z))-t, 0, 10)
l2_point = np.array([2/(1+lagrange_l2), .6/(2+lagrange_l2)])
print(l1_point, l2_point)

# Paragraph 11
loss = np.array([.20, .23])
magnitude = np.array([10., 2.])
print(loss + .01*magnitude)  # [0.30, 0.25]

# Paragraph 12
losses = np.array([.4, .2, .3]); penalty, lam = 2., .05
print(len(losses)*(losses.mean()+lam*penalty),
      losses.sum()+len(losses)*lam*penalty)

# Paragraph 13
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

# Paragraph 14
from sklearn.linear_model import Lasso
beta_ols = np.linalg.lstsq(X, y, rcond=None)[0]
beta_ridge = np.linalg.solve(X.T@X+len(y)*.10*np.eye(3), X.T@y)
beta_lasso = Lasso(alpha=.07, fit_intercept=False,
                   tol=1e-10, max_iter=50000).fit(X, y).coef_
for name, beta in [("OLS", beta_ols), ("Ridge", beta_ridge), ("Lasso", beta_lasso)]:
    error = np.mean((ytest-ybar-Xtest@beta)**2)
    print(name, np.round(beta, 4), "test MSE:", round(error, 4))

lambda_max = np.max(np.abs(X.T@y))/len(y)
for ratio in [.1, .5, 1., 1.2]:
    b = Lasso(alpha=ratio*lambda_max, fit_intercept=False,
              tol=1e-10, max_iter=50000).fit(X, y).coef_
    print("lambda/lambda_max:", ratio, "active:", np.count_nonzero(np.abs(b)>1e-8))

# Paragraph 15
def soft(v, threshold):
    return np.sign(v) * np.maximum(np.abs(v)-threshold, 0.0)
a = np.array([-2., -.5, 0., .5, 2.]); lam = .8
print("OLS:", a)
print("Ridge:", a/(1+lam))
print("Lasso:", soft(a, lam))

# Paragraph 16
r = y-X@beta_lasso
corr = X.T@r/len(y)
active = np.abs(beta_lasso) > 1e-8
violations = np.where(active, np.abs(corr-.07*np.sign(beta_lasso)),
                      np.maximum(np.abs(corr)-.07, 0))
print("Largest KKT violation:", violations.max())

# Paragraph 17
weights = np.array([.04, -.20, 0.])
gradient = np.array([.10, -.50, -.60])
intermediate = weights-.1*gradient
print(intermediate, "->", soft(intermediate, .1*.4))

# Paragraph 18
lam, n = .07, len(y)
r = y-X@beta_lasso
u = r/max(1., np.max(np.abs(X.T@r))/(n*lam))
primal = r@r/(2*n)+lam*np.abs(beta_lasso).sum()
dual = y@u/n-u@u/(2*n)
print("Primal / dual:", primal, dual)
print("Gap:", primal-dual)  # Near zero; tiny rounding errors are possible.

# Paragraph 19
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

# Paragraph 20
for lam in [.25, 3.]:
    bias = 2/(1+lam)-2
    variance = 1/(1+lam)**2
    print(lam, bias, variance, bias*bias+variance)
d = np.linalg.svd(X, compute_uv=False)
print("Ridge effective degrees of freedom:", np.sum(d*d/(d*d+len(y)*.10)))

# Paragraph 21
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

# Paragraph 22
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

# Paragraph 23
A_bad = np.array([[1., 2.]])
truth = np.array([1., 0.])
alternative = basis_pursuit(A_bad, A_bad@truth)
print("Same measurement:", A_bad@truth, A_bad@alternative)
print("True / recovered:", truth, alternative)
print("L1 costs:", np.abs(truth).sum(), np.abs(alternative).sum())

# Paragraph 24
a = np.array([3., -1., .2, -.1, .05]); s = 2
tail = np.sort(np.abs(a))[::-1][s:].sum()
print("Best s-term L1 tail:", tail, "normalized:", tail/np.sqrt(s))

# Paragraph 25
observations = np.array([10., 11., 12., 250., 13.])
print("Mean / median:", observations.mean(), np.median(observations))
D = np.array([[1., 1.], [1., -1.]])/np.sqrt(2)
image_row = np.array([10., 11.])
print("Transform denoising:", D@soft(D.T@image_row, .5))

for outlier in [25., 250., 2500.]:
    sample = np.array([10., 11., 12., outlier, 13.])
    print(outlier, "mean:", sample.mean(), "median:", np.median(sample))

# Paragraph 26
row = np.array([10., 10., 10., 50., 50., 50.])
print("Differences:", np.diff(row), "TV:", np.abs(np.diff(row)).sum())
two_pixels, lam = np.array([10., 13.]), 1.
mean = two_pixels.mean()
delta = soft(two_pixels[1]-two_pixels[0], 2*lam)
print("Two-pixel TV result:", [mean-delta/2, mean+delta/2])

for lam_tv in [0., .5, 1., 1.5, 2.]:
    difference = soft(13.-10., 2*lam_tv)
    pixels = np.array([11.5-difference/2, 11.5+difference/2])
    print(lam_tv, pixels, "difference:", np.diff(pixels)[0])

# Paragraph 27
W = np.array([[1., 0., -2.], [0., .5, 0.]])
print("Entrywise / induced:", np.abs(W).sum(), np.linalg.norm(W, 1))
structured = W.copy(); structured[1] = 0
print("Scattered:", W, "Zero row:", structured)

# Paragraph 28
inputs = np.array([-2., 0., 1., 3.]); a, b, c = 2., 3., 4.
original = b*np.maximum(a*inputs, 0)
rescaled = (b/c)*np.maximum(c*a*inputs, 0)
print(np.allclose(original, rescaled), abs(a)+abs(b), abs(c*a)+abs(b/c))

# Paragraph 29
weights = np.array([.003, -.2, .07, -.0001])
tau = .01
mask = (np.abs(weights) > tau).astype(float)
pruned = weights*mask
gradient = np.array([1., -.4, .3, -1.])
refined = (pruned-.01*gradient)*mask
print("Pruned:", pruned, "fixed-mask refinement:", refined)
gamma, offset = 0., .3
print("Zero-scale channel:", gamma*np.array([-1., 2.])+offset)

# Paragraph 30
print("Exact / threshold sparsity:", np.mean(weights == 0),
      np.mean(np.abs(weights) <= tau))
rows, cols, nnz = 1000, 1000, 100000
print("Dense / CSR bytes:", 4*rows*cols, 8*nnz+4*(rows+1))
print("Convolution weights:", 64*64*3*3, 32*64*3*3)

# Paragraph 31
lam, alpha, c = .3, .5, 2.
for beta in [np.array([c, 0.]), np.array([c/2, c/2])]:
    charge = lam*(alpha*np.abs(beta).sum()+(1-alpha)*(beta@beta)/2)
    print(beta, charge)

from sklearn.linear_model import ElasticNet
z = np.array([-2., -1., 1., 2.])
duplicated = np.column_stack([z, z])
for mix in [1., .5]:
    fit = ElasticNet(alpha=.2, l1_ratio=mix, fit_intercept=False,
                     tol=1e-10, max_iter=50000).fit(duplicated, 2*z)
    print("L1 fraction:", mix, "coefficients:", np.round(fit.coef_, 4))

# Paragraph 32
initial = np.array([2., .2, .01])
print("Adaptive weights:", (np.abs(initial)+1e-3)**-1)
def group_shrink(a, threshold):
    norm = np.linalg.norm(a)
    return np.zeros_like(a) if norm == 0 else max(1-threshold/norm, 0)*a
a = np.array([.2, 2., -.1])
print("Group:", group_shrink(a, .8))
print("Sparse group:", group_shrink(soft(a, .3), .8))

# Paragraph 33
w = np.array([0., 0., 2., 2., 2.])
print("Fused penalty:", .1*np.abs(w).sum()+.4*np.abs(np.diff(w)).sum())
print("Nonnegative threshold:", np.maximum(np.array([-1., .2, 2.])-.5, 0))

# Paragraph 34
M = np.array([[3., 1.], [0., .4]])
U, singular_values, Vt = np.linalg.svd(M, full_matrices=False)
shrunk = np.maximum(singular_values-.7, 0.)
M_low_rank = (U*shrunk)@Vt
print(singular_values, shrunk)
print(np.linalg.matrix_rank(M), np.linalg.matrix_rank(M_low_rank))
truncated = (U*np.array([singular_values[0], 0.]))@Vt
print("Nuclear / truncated error:", np.linalg.norm(M-M_low_rank),
      np.linalg.norm(M-truncated))

# Paragraph 35
values = np.array([0., 1., 2.])
gaussian_penalty = values**2/2
laplace_penalty = np.abs(values)
print("Gaussian penalty / increments:", gaussian_penalty, np.diff(gaussian_penalty))
print("Laplace penalty / increments:", laplace_penalty, np.diff(laplace_penalty))

# Paragraph 36
x = np.array([1., 2., 3.]); beta, c = 2., 10.
print("Same predictions:", np.allclose(x*beta, (c*x)*(beta/c)))
print("Different L1 charge:", abs(beta), abs(beta/c))
identical = np.column_stack([x, x])
print(np.allclose(identical@np.array([2., 0.]), identical@np.array([1., 1.])))

orthogonal = np.array([[1., 1.], [1., -1.], [-1., 1.], [-1., -1.]])
target = .2*orthogonal.sum(axis=1)
for factor in [1., 10.]:
    scaled = orthogonal*np.array([1., factor])
    for standardize in [False, True]:
        design = scaled/scaled.std(0) if standardize else scaled
        b = Lasso(alpha=.3, fit_intercept=False, tol=1e-10).fit(design, target).coef_
        print(factor, "standardized:", standardize, "coefficients:", b)
