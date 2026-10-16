"""Optional implementations; the essay does not require this file."""
import numpy as np

def soft(v, threshold):
    return np.sign(v) * np.maximum(np.abs(v)-threshold, 0.0)

def lasso_cd(X, y, lam, beta0=None, tol=1e-10, max_iter=50000):
    n, p = X.shape
    beta = np.zeros(p) if beta0 is None else beta0.copy()
    q = np.sum(X*X, axis=0)/n
    if np.any(q == 0):
        raise ValueError("Remove constant columns before fitting.")
    residual = y-X@beta
    for _ in range(max_iter):
        previous = beta.copy()
        for j in range(p):
            residual += X[:, j]*beta[j]
            c = X[:, j]@residual/n
            beta[j] = soft(c, lam)/q[j]
            residual -= X[:, j]*beta[j]
        if np.max(np.abs(beta-previous)) < tol:
            return beta
    raise RuntimeError("Coordinate descent did not converge.")

def primal_dual(X, y, beta, lam):
    n = len(y)
    residual = y-X@beta
    corr = np.max(np.abs(X.T@residual))/n
    u = residual/max(1.0, corr/lam)
    primal = residual@residual/(2*n)+lam*np.abs(beta).sum()
    dual = y@u/n-u@u/(2*n)
    return primal, dual, u
