# A Deep Reading of SVD
## The Summit

Talking about **SVD** in linear algebra can feel like jumping straight to the top of a mountain. Why begin at the highest point of the theory before we know the path that leads there?

Do not worry. We are not going to memorize the summit or disappear into a maze of proofs. We will stand there for a moment, then take it apart until we can see what the mountain is made of.

# From Composition to Decomposition

Since the story is about **decomposition**, begin in the opposite direction: **composition**.

Put three matrices in front of us, \(A\), \(B\), and \(C\). Their dimensions fit, so we can connect them:

\[
W=ABC.
\]

That is composition in its simplest form: we know the pieces, we combine them, and a new object appears. If a vector \(x\) enters the chain, the action begins on the right:

\[
Wx=ABCx=A(B(Cx)),
\]

so

\[
x\xrightarrow{C}Cx\xrightarrow{B}BCx\xrightarrow{A}ABCx.
\]

Take a small numerical example:

\[
A=
\begin{bmatrix}
1&2\\
0&1
\end{bmatrix},
\qquad
B=
\begin{bmatrix}
2&0\\
0&\tfrac12
\end{bmatrix},
\qquad
C=
\begin{bmatrix}
0&-1\\
1&0
\end{bmatrix}.
\]

Together they become

\[
W=ABC=
\begin{bmatrix}
1&-2\\
\tfrac12&0
\end{bmatrix}.
\]

[[interactive:composition-three-matrices]]

### Composition in Python

```python
import numpy as np

A = np.array([[1., 2.],
              [0., 1.]])

B = np.array([[2., 0.],
              [0., 0.5]])

C = np.array([[0., -1.],
              [1.,  0.]])

W = A @ B @ C
print(W)
```

This is the forward direction: known pieces produce a final matrix.



Here you can **touch composition** instead of merely reading its definition. Change \(x\), press the matrices, and watch the vector move through \(C\), then \(B\), then \(A\).

Now reverse the question.

Instead of giving you the pieces, I place one matrix \(D\) in front of you. We can inspect its rows and columns, calculate its rank, and measure everything visible from the outside. Then I say: **open it. Show me the structure hiding inside.**

Without a method, we could guess until the stars burn out. That is precisely why linear algebra developed decompositions: we do not want arbitrary factors; we want pieces with structure and jobs we can name.

The pieces may be triangular, as in **LU**; orthonormal directions plus triangular coefficients, as in **QR**; or one triangular factor mirrored by its transpose, as in **Cholesky**. Sometimes we change the viewpoint itself, as in **spectral decomposition** and **Schur**. Sometimes we separate rotation from stretching, as in the **polar decomposition**. Then we reach **SVD**, which takes the stage from here.

## The Decomposition Atlas

There are many names, but one instinct connects them: do not fight the matrix in the form in which it arrived. Find a representation in which each piece has a clear job.

In the interactive atlas below, choose LU, QR, Cholesky, Spectral, or SVD. Open the factors, then rebuild the original matrix. Do not memorize five formulas; watch the same move repeat.

[[interactive:decomposition-gallery]]

### A Small Decomposition Atlas in Python

```python
import numpy as np

A = np.array([[4., 2.],
              [2., 3.]])

# QR
Q, R = np.linalg.qr(A)
print(np.allclose(A, Q @ R))

# SVD
U, s, Vt = np.linalg.svd(A)
Sigma = np.diag(s)
print(np.allclose(A, U @ Sigma @ Vt))

# Spectral decomposition for symmetric A
lam, E = np.linalg.eigh(A)
print(np.allclose(A, E @ np.diag(lam) @ E.T))

# Cholesky for positive-definite A
L = np.linalg.cholesky(A)
print(np.allclose(A, L @ L.T))
```

With SciPy:

```python
import numpy as np
from scipy.linalg import lu, schur, polar

A = np.array([[4., 2.],
              [2., 3.]])

P, L, U_lu = lu(A)
T, Z = schur(A)
Qp, H = polar(A)

print(np.allclose(A, P @ L @ U_lu))
print(np.allclose(A, Z @ T @ Z.T))
print(np.allclose(A, Qp @ H))
```

From here, SVD no longer feels like a jump into a different chapter. It is simply the decomposition we are about to examine more closely than the others.

---

# The Essence, Nothing More

For any real matrix

\[
A\in\mathbb R^{m\times n},
\]

we can write

\[
\boxed{A=U\Sigma V^T}.
\]

In the full picture, \(U\) is an \(m\times m\) orthogonal matrix, \(V\) is an \(n\times n\) orthogonal matrix, and \(\Sigma\) is an \(m\times n\) rectangular diagonal matrix.

On the diagonal of \(\Sigma\) sit the singular values:

\[
\sigma_1\ge\sigma_2\ge\cdots\ge0.
\]

The columns of \(V\) are the **right singular vectors**; the columns of \(U\) are the **left singular vectors**. For complex matrices, \(T\) is replaced by the conjugate transpose \(^*\).

[[interactive:svd-three-factors]]

That is the formula. The meaning appears when each factor gets a job.


### Compute and Check an SVD

```python
import numpy as np

A = np.array([[3., 1.],
              [1., 2.]])

U, s, Vt = np.linalg.svd(A)
Sigma = np.diag(s)

print("U =\n", U)
print("singular values =", s)
print("V^T =\n", Vt)

print("U^T U =\n", U.T @ U)
print("V^T V =\n", Vt @ Vt.T)

A_reconstructed = U @ Sigma @ Vt
print(A_reconstructed)
print("error =", np.linalg.norm(A - A_reconstructed))
```

For a rectangular matrix, use

```python
import numpy as np

A = np.array([[3., 1.],
              [1., 2.]])
U, s, Vt = np.linalg.svd(A, full_matrices=False)
```

for the compact/economy form when that is all you need.

---

# The Story Begins on the Right

Feed in a vector \(x\):

\[
Ax=U\Sigma V^Tx.
\]

Begin with \(V^T\). It asks how much of \(x\) lies along each special direction \(v_i\). If

\[
V=[v_1\ v_2\ \cdots\ v_n],
\]

then

\[
V^Tx=
\begin{bmatrix}
v_1^Tx\\
v_2^Tx\\
\vdots
\end{bmatrix}.
\]

So \(V^T\) rewrites the input in coordinates designed specifically for this matrix.

Then \(\Sigma\) acts. Nothing complicated is mixed together anymore; each coordinate is multiplied by one number:

\[
\Sigma
\begin{bmatrix}
a_1\\a_2\\\vdots
\end{bmatrix}
=
\begin{bmatrix}
\sigma_1a_1\\
\sigma_2a_2\\
\vdots
\end{bmatrix}.
\]

This is the quiet center of SVD: in the right coordinates, a complicated transformation becomes independent stretching or shrinking along separate axes.

Finally, \(U\) places those scaled components into their output directions.

Remember the story rather than the letters:

\[
\boxed{
V^T:\text{ analyze the input}
\quad\longrightarrow\quad
\Sigma:\text{ stretch or shrink}
\quad\longrightarrow\quad
U:\text{ orient the output}
}
\]

And one equation carries the whole idea:

\[
\boxed{Av_i=\sigma_i u_i.}
\]

Send in the special direction \(v_i\), and \(A\) sends it out along \(u_i\), scaled by \(\sigma_i\).

---

# The Secret Behind the Beauty

Eigenvalue language is naturally square:

\[
Av=\lambda v
\]

requires \(Av\) and \(v\) to live in the same vector space.

If

\[
A:\mathbb R^n\rightarrow\mathbb R^m
\]

with \(m\neq n\), that is not true in general.

SVD avoids the problem by using **two different orthonormal coordinate systems**:

Here \(V\) belongs to the input space \(\mathbb R^n\), while \(U\) belongs to the output space \(\mathbb R^m\).

The right singular vector \(v_i\) lives where the input lives.

The left singular vector \(u_i\) lives where the output lives.

They are connected by the equation

\[
\boxed{Av_i=\sigma_i u_i.}
\]

This equation is the heart of SVD.

Read it literally:

> Feed the special input direction \(v_i\) into \(A\). The matrix does not throw it into some arbitrary mess. It sends it exactly into the special output direction \(u_i\), scaled by \(\sigma_i\).

There is a companion equation

\[
\boxed{A^Tu_i=\sigma_i v_i}
\]

for real matrices, or

\[
A^*u_i=\sigma_i v_i
\]

for complex matrices.

---

# When the Circle Changes Shape

Take the unit sphere in the input space.

The first orthogonal factor \(V^T\) cannot deform it; rotations and reflections preserve a sphere.

Then \(\Sigma\) stretches the sphere by different amounts along orthogonal axes. The sphere becomes an ellipsoid.

Finally \(U\) rotates or reflects that ellipsoid into its final orientation in the output space.

The lengths of the principal semiaxes of the ellipsoid are the singular values.

That is why a large \(\sigma_i\) means that the corresponding direction has a strong effect, while a tiny \(\sigma_i\) means that direction barely survives the transformation.

The companion code can still generate static checkpoints of these stages, but the interactive version is more faithful to the idea: move through the stages and watch the same object change rather than comparing four disconnected pictures.

[[interactive:svd-geometry]]

### Let the Geometry Move

```python
import numpy as np
import matplotlib.pyplot as plt

A = np.array([[3., 1.],
              [1., 2.]])

U, s, Vt = np.linalg.svd(A)
Sigma = np.diag(s)

theta = np.linspace(0, 2*np.pi, 500)
circle = np.vstack([np.cos(theta), np.sin(theta)])

after_vt = Vt @ circle
after_sigma = Sigma @ after_vt
after_u = U @ after_sigma

plt.figure(figsize=(6, 6))
plt.plot(after_u[0], after_u[1])
plt.axhline(0)
plt.axvline(0)
plt.gca().set_aspect("equal", adjustable="box")
plt.title("Final image of the unit circle under A")
plt.show()
```

For teaching, it is even better to plot `circle`, `after_vt`, `after_sigma`, and `after_u` in separate figures so that the transformation can be watched one stage at a time.



---

# Where Do These Pieces Come From?

The formula is beautiful, but we should not accept mysterious matrices that appear from smoke.

The first doorway is

\[
A^TA.
\]

For any real \(A\), the matrix \(A^TA\) is square and symmetric:

\[
(A^TA)^T=A^TA.
\]

It is also positive semidefinite because for every vector \(x\),

\[
x^TA^TAx=(Ax)^T(Ax)=\|Ax\|^2\ge0.
\]

Therefore its eigenvalues are real and nonnegative, and it has an orthonormal eigenbasis.

Suppose

\[
A=U\Sigma V^T.
\]

Then

\[
A^TA
=(U\Sigma V^T)^T(U\Sigma V^T).
\]

So

\[
A^TA
=V\Sigma^T U^TU\Sigma V^T.
\]

Since \(U^TU=I\),

\[
\boxed{
A^TA=V(\Sigma^T\Sigma)V^T.
}
\]

But \(\Sigma^T\Sigma\) is diagonal, with entries

\[
\sigma_1^2,\sigma_2^2,\ldots.
\]

Therefore:

\[
\boxed{
\text{eigenvectors of }A^TA
=\text{right singular vectors of }A
}
\]

and

\[
\boxed{
\lambda_i(A^TA)=\sigma_i^2.
}
\]

So

\[
\boxed{
\sigma_i=\sqrt{\lambda_i(A^TA)}.
}
\]

Similarly,

\[
AA^T=U(\Sigma\Sigma^T)U^T,
\]

so the left singular vectors are eigenvectors of \(AA^T\).

This is the computational bridge that makes SVD feel less magical.

---

# First Clue: \(A^TA\)

For a real matrix, an educational construction is easier to remember as a journey than as a recipe list. Begin with \(A^TA\). Its orthonormal eigenvectors give the directions \(v_i\), and its nonnegative eigenvalues \(\lambda_i\) reveal the scales through

\[
\sigma_i=\sqrt{\lambda_i}.
\]

Whenever \(\sigma_i\neq0\), send \(v_i\) through \(A\) and normalize the result:

\[
u_i=\frac{Av_i}{\sigma_i}.
\]

So the three parts are not pulled from a hat: \(A^TA\) chooses the important input directions, the eigenvalues determine how strongly they are stretched, and \(A\) itself shows us where those directions land.
Then

\[
Av_i=\sigma_i u_i.
\]

Why are the \(u_i\) unit vectors?

\[
\|u_i\|^2
=
\frac{\|Av_i\|^2}{\sigma_i^2}
=
\frac{v_i^TA^TAv_i}{\sigma_i^2}
=
\frac{v_i^T(\sigma_i^2v_i)}{\sigma_i^2}
=1.
\]

Why are different \(u_i\) perpendicular?

For \(i\neq j\),

\[
u_i^Tu_j
=
\frac{v_i^TA^TAv_j}{\sigma_i\sigma_j}
=
\frac{v_i^T(\sigma_j^2v_j)}{\sigma_i\sigma_j}
=0,
\]

because \(v_i\perp v_j\).

So the nonzero singular directions already give orthonormal columns in both spaces.

This route is extremely useful for understanding and for hand calculations.

For the full existence proof, we now use the Hermitian block construction from the study notes. It looks like a trick at first; in a moment, it will feel inevitable.


### Build SVD from \(A^TA\)

This is useful for understanding the theory. For numerical production work, prefer `np.linalg.svd`.

```python
import numpy as np

def svd_from_ata(A, tol=1e-12):
    A = np.asarray(A, dtype=float)

    # 1. Symmetric positive-semidefinite Gram matrix
    G = A.T @ A

    # 2. Its orthonormal eigenvectors become right singular vectors
    eigenvalues, V = np.linalg.eigh(G)

    # 3. Sort from largest to smallest
    order = np.argsort(eigenvalues)[::-1]
    eigenvalues = np.maximum(eigenvalues[order], 0.0)
    V = V[:, order]

    # 4. Singular values are square roots
    s = np.sqrt(eigenvalues)

    # 5. Keep the nonzero part for the condensed SVD
    keep = s > tol
    s = s[keep]
    V = V[:, keep]

    # 6. Av_i = sigma_i u_i
    U = A @ V / s

    return U, s, V.T
```

# The Existence Proof

## What Are We Actually Trying to Prove?

Let

\[
A\in\mathbb C^{m\times n}
\]

have rank

\[
r=\operatorname{rank}(A).
\]

We want to prove the existence of a **condensed SVD**

\[
\boxed{A=X\Sigma_rY^*},
\]

where

\[
X\in\mathbb C^{m\times r},
\qquad
Y\in\mathbb C^{n\times r},
\]

have orthonormal columns,

\[
X^*X=I_r,
\qquad
Y^*Y=I_r,
\]

and

\[
\Sigma_r=
\operatorname{diag}(\sigma_1,\ldots,\sigma_r),
\qquad
\sigma_1\ge\cdots\ge\sigma_r>0.
\]

For real matrices, replace \(^*\) with \(^T\).

The proof has one main trick:

\[
\boxed{
\text{turn a rectangular-matrix problem into a Hermitian eigenvalue problem.}
}
\]

---

# The Tool Behind the Door

A matrix \(W\) is Hermitian if

\[
W=W^*.
\]

The spectral theorem says that a Hermitian matrix has an orthonormal basis of eigenvectors and real eigenvalues. Equivalently,

\[
W=Z\Lambda Z^*,
\]

where \(Z\) is unitary and \(\Lambda\) is real diagonal.

This theorem is the engine of the proof.

But \(A\) may be rectangular, so \(A\) itself may not even possess an ordinary eigendecomposition.

We need to build a square Hermitian matrix from it.

---

# The Trick That Opens the Door

Define

\[
\boxed{
W=
\begin{bmatrix}
0&A\\
A^*&0
\end{bmatrix}.
}
\]

[[interactive:svd-existence-proof-map]]

### Check the Block-Matrix Proof Numerically

```python
import numpy as np

A = np.array([[3., 1.],
              [0., 2.],
              [2., 2.]])

U, s, Vt = np.linalg.svd(A, full_matrices=False)

m, n = A.shape
W = np.block([
    [np.zeros((m, m)), A],
    [A.T, np.zeros((n, n))]
])

# Hermitian/symmetric, so eigvalsh is appropriate
w_eigenvalues = np.linalg.eigvalsh(W)

expected = np.sort(
    np.concatenate([
        -s,
        np.zeros(m + n - 2*len(s)),
        s
    ])
)

print(w_eigenvalues)
print(expected)
print(np.allclose(w_eigenvalues, expected))
```

This numerical experiment displays exactly what the proof predicts:

\[
\operatorname{spec}(W)
=
\{-\sigma_i,0,+\sigma_i\}.
\]



The upper-left zero block is \(m\times m\).

The lower-right zero block is \(n\times n\).

Therefore

\[
W\in\mathbb C^{(m+n)\times(m+n)},
\]

so \(W\) is square.

Now take the conjugate transpose:

\[
W^*
=
\begin{bmatrix}
0&A\\
A^*&0
\end{bmatrix}^*
=
\begin{bmatrix}
0&A\\
A^*&0
\end{bmatrix}
=W.
\]

Thus

\[
\boxed{W=W^*.}
\]

So \(W\) is Hermitian, and the spectral theorem applies.

That single construction is the door through which the SVD enters.

---

# Split the Hidden Vector

Take an eigenvector \(z\) of \(W\) with eigenvalue \(\sigma\):

\[
Wz=\sigma z.
\]

Because \(z\in\mathbb C^{m+n}\), write it in two blocks:

\[
\boxed{
z=
\begin{bmatrix}
x\\y
\end{bmatrix}},
\]

with

\[
x\in\mathbb C^m,
\qquad
y\in\mathbb C^n.
\]

Substitute:

\[
\begin{bmatrix}
0&A\\
A^*&0
\end{bmatrix}
\begin{bmatrix}
x\\y
\end{bmatrix}
=
\sigma
\begin{bmatrix}
x\\y
\end{bmatrix}.
\]

Block multiplication gives

\[
\begin{bmatrix}
Ay\\
A^*x
\end{bmatrix}
=
\begin{bmatrix}
\sigma x\\
\sigma y
\end{bmatrix}.
\]

Therefore

\[
\boxed{Ay=\sigma x}
\]

and

\[
\boxed{A^*x=\sigma y.}
\]

Stop here for a moment.

This is already the SVD relationship.

Compare

\[
Ay=\sigma x
\]

with

\[
Av_i=\sigma_i u_i.
\]

So the upper block \(x\) behaves like a left singular vector, the lower block \(y\) behaves like a right singular vector, and the eigenvalue \(\sigma\) behaves like a singular value.

The singular structure of \(A\) was hiding inside the eigenstructure of \(W\).

---

# Why the Values Come in Pairs

Suppose

\[
\begin{bmatrix}x\\y\end{bmatrix}
\]

has eigenvalue \(+\sigma\). Then

\[
Ay=\sigma x,
\qquad
A^*x=\sigma y.
\]

Now consider

\[
\begin{bmatrix}x\\-y\end{bmatrix}.
\]

Applying \(W\),

\[
W
\begin{bmatrix}x\\-y\end{bmatrix}
=
\begin{bmatrix}-Ay\\A^*x\end{bmatrix}
=
\begin{bmatrix}-\sigma x\\\sigma y\end{bmatrix}
=
-\sigma
\begin{bmatrix}x\\-y\end{bmatrix}.
\]

Hence

\[
\boxed{
\sigma\text{ eigenvalue}
\quad\Longrightarrow\quad
-\sigma\text{ eigenvalue}.
}
\]

The nonzero eigenvalues of \(W\) therefore occur in opposite pairs.

If \(r=\operatorname{rank}(A)\), the nonzero part is organized as

\[
\sigma_1,\ldots,\sigma_r,
-\sigma_1,\ldots,-\sigma_r.
\]

The remaining eigenvalues are zero.

---

# Give the Pieces Unit Length

For a positive eigenvalue \(\sigma\), use the pair

\[
z_+=\begin{bmatrix}x\\y\end{bmatrix},
\qquad
z_-=\begin{bmatrix}x\\-y\end{bmatrix}.
\]

Because \(W\) is Hermitian and \(+\sigma\neq-\sigma\) when \(\sigma>0\), the eigenvectors belonging to those distinct eigenvalues are orthogonal:

\[
z_+^*z_-=0.
\]

Expanding,

\[
x^*x-y^*y=0.
\]

So

\[
\|x\|^2=\|y\|^2.
\]

Choose the block vector so that

\[
\|z_+\|^2=2.
\]

Then

\[
\|x\|^2+\|y\|^2=2.
\]

Together with equality of the two norms,

\[
\boxed{\|x\|=\|y\|=1.}
\]

So each candidate singular vector has unit length.

---

# Collect the Pieces

For the positive values

\[
\sigma_1\ge\cdots\ge\sigma_r>0,
\]

obtain vectors

\[
x_1,\ldots,x_r
\]

and

\[
y_1,\ldots,y_r
\]

such that

\[
Ay_i=\sigma_i x_i,
\qquad
A^*x_i=\sigma_i y_i.
\]

Define

\[
X=[x_1\ \cdots\ x_r],
\]

\[
Y=[y_1\ \cdots\ y_r],
\]

and

\[
\Sigma_r=\operatorname{diag}(\sigma_1,\ldots,\sigma_r).
\]

The associated normalized eigenvectors of \(W\) can be arranged as

\[
\widetilde Z
=
\frac1{\sqrt2}
\begin{bmatrix}
X&X\\
Y&-Y
\end{bmatrix},
\]

and their eigenvalues as

\[
\widetilde\Lambda
=
\begin{bmatrix}
\Sigma_r&0\\
0&-\Sigma_r
\end{bmatrix}.
\]

The zero-eigenvalue eigenvectors do not contribute to \(W=Z\Lambda Z^*\), because their entries in \(\Lambda\) are zero.

Therefore the nonzero part alone gives

\[
W=\widetilde Z\widetilde\Lambda\widetilde Z^*.
\]

---

# Put the Matrix Back Together

Substitute the block matrices:

\[
W
=
\frac12
\begin{bmatrix}
X&X\\
Y&-Y
\end{bmatrix}
\begin{bmatrix}
\Sigma_r&0\\
0&-\Sigma_r
\end{bmatrix}
\begin{bmatrix}
X^*&Y^*\\
X^*&-Y^*
\end{bmatrix}.
\]

The first two factors give

\[
\begin{bmatrix}
X\Sigma_r&-X\Sigma_r\\
Y\Sigma_r&Y\Sigma_r
\end{bmatrix}.
\]

Multiplying the final block matrix gives

\[
W
=
\begin{bmatrix}
0&X\Sigma_rY^*\\
Y\Sigma_rX^*&0
\end{bmatrix}.
\]

But by definition

\[
W=
\begin{bmatrix}
0&A\\
A^*&0
\end{bmatrix}.
\]

Corresponding blocks must be equal. Hence

\[
\boxed{A=X\Sigma_rY^*.}
\]

We have recovered the condensed SVD formula.

---

# Why the Directions Stay Clean

Unit length has already been established.

We still need different columns to be perpendicular.

For two indices \(i\neq j\), choose the positive-eigenvalue block vectors orthogonally:

\[
\begin{bmatrix}x_i\\y_i\end{bmatrix}^*
\begin{bmatrix}x_j\\y_j\end{bmatrix}=0.
\]

Thus

\[
x_i^*x_j+y_i^*y_j=0.
\]

Also compare the positive vector for index \(i\) with the negative partner of index \(j\):

\[
\begin{bmatrix}x_i\\y_i\end{bmatrix}^*
\begin{bmatrix}x_j\\-y_j\end{bmatrix}=0,
\]

which gives

\[
x_i^*x_j-y_i^*y_j=0.
\]

Add the equations:

\[
2x_i^*x_j=0,
\]

so

\[
x_i^*x_j=0.
\]

Subtract them:

\[
2y_i^*y_j=0,
\]

so

\[
y_i^*y_j=0.
\]

Therefore

\[
\boxed{X^*X=I_r}
\]

and

\[
\boxed{Y^*Y=I_r.}
\]

All requirements of the condensed SVD are satisfied.

Thus every matrix possesses a singular value decomposition.

---

# The Proof in One Breath

If the details begin to blur, remember the skeleton:

\[
A
\]

\[
\downarrow
\]

build

\[
W=\begin{bmatrix}0&A\\A^*&0\end{bmatrix}
\]

\[
\downarrow
\]

\(W\) is Hermitian

\[
\downarrow
\]

spectral theorem gives orthonormal eigenvectors

\[
\downarrow
\]

split each eigenvector into

\[
\begin{bmatrix}x_i\\y_i\end{bmatrix}
\]

\[
\downarrow
\]

obtain

\[
Ay_i=\sigma_i x_i,
\qquad
A^*x_i=\sigma_i y_i
\]

\[
\downarrow
\]

collect \(x_i,y_i,\sigma_i\)

\[
\downarrow
\]

\[
\boxed{A=X\Sigma_rY^*.}
\]

The proof does not invent singular vectors from nothing. It finds them inside the eigenvectors of a carefully constructed Hermitian matrix.

---

# From Product to Layers

Now comes a second interpretation of SVD, and for data science this one is just as important as the geometric picture.

Write

\[
U=[u_1\ u_2\ \cdots],
\qquad
V=[v_1\ v_2\ \cdots].
\]

Because \(\Sigma\) is diagonal,

\[
\boxed{
A=
\sum_{i=1}^{\min(m,n)}
\sigma_i u_i v_i^T.
}
\]

Each outer product

\[
u_i v_i^T
\]

has rank 1.

Why?

Every column of \(u_iv_i^T\) is a scalar multiple of \(u_i\). So its column space contains only one independent direction.

Therefore SVD says:

> **A matrix is an ordered stack of rank-1 layers.**

The number \(\sigma_i\) tells us how strong layer \(i\) is.

Large singular value: strong layer.

Small singular value: weak layer.

Zero singular value: no layer at all.

Hence

\[
\boxed{
\operatorname{rank}(A)
=
\text{number of nonzero singular values}.
}
\]

The companion visualization script extracts the first rank-1 layers separately:

[[interactive:rank1-layers]]

### Looking at a Matrix

A very simple matrix heatmap is often enough to make structure visible:

```python
import numpy as np
import matplotlib.pyplot as plt

A = np.array([
    [5., 4., 3., 2., 1.],
    [4., 3.2, 2.4, 1.6, 0.8],
    [3., 2.4, 1.8, 1.2, 0.6],
    [2., 1.6, 1.2, 0.8, 0.4],
    [1., 0.8, 0.6, 0.4, 0.2],
])

plt.figure(figsize=(7, 5))
im = plt.imshow(A, aspect="auto")
plt.colorbar(im)
plt.title("Matrix values")
plt.xlabel("column")
plt.ylabel("row")
plt.show()
```

Use the same visualization as a sequence: begin with the original matrix \(A\), isolate one rank-1 layer, rebuild a truncated approximation \(A_k\), and finally inspect the residual \(A-A_k\). That makes matrix decomposition feel like an object being opened rather than four unrelated pictures.


### Pull Out the Rank-1 Layers

```python
import numpy as np

A = np.array([
    [5., 4., 3., 2., 1.],
    [4., 3.2, 2.4, 1.6, 0.8],
    [3., 2.4, 1.8, 1.2, 0.6],
    [2., 1.6, 1.2, 0.8, 0.4],
    [1., 0.8, 0.6, 0.4, 0.2],
])
U, s, Vt = np.linalg.svd(A, full_matrices=False)
layers = [s[i] * np.outer(U[:, i], Vt[i, :]) for i in range(len(s))]

# Exact reconstruction
A_again = sum(layers)
print(np.allclose(A, A_again))
```

Each `layer_i` has rank at most 1.

To visualize a layer:

```python
import matplotlib.pyplot as plt
import numpy as np

A = np.array([
    [5., 4., 3., 2., 1.],
    [4., 3.2, 2.4, 1.6, 0.8],
    [3., 2.4, 1.8, 1.2, 0.6],
    [2., 1.6, 1.2, 0.8, 0.4],
    [1., 0.8, 0.6, 0.4, 0.2],
])
U, s, Vt = np.linalg.svd(A, full_matrices=False)
first_layer = s[0] * np.outer(U[:, 0], Vt[0, :])

plt.figure()
plt.imshow(first_layer, aspect="auto")
plt.colorbar()
plt.title("First rank-1 SVD layer")
plt.show()
```

---

# How Many Pieces Do We Need?

This connects SVD with the deeper meaning of matrix rank.

If

\[
\operatorname{rank}(A)=r,
\]

then \(A\) can be written as a sum of \(r\) rank-1 matrices:

\[
A=R_1+\cdots+R_r.
\]

SVD provides one such representation:

\[
A=\sigma_1u_1v_1^T+\cdots+\sigma_ru_rv_r^T.
\]

Why can we not do it with fewer than \(r\) rank-1 pieces?

Because rank is subadditive:

\[
\operatorname{rank}(B+C)
\le
\operatorname{rank}(B)+\operatorname{rank}(C).
\]

If \(A\) were a sum of only \(r-1\) rank-1 matrices, then

\[
\operatorname{rank}(A)
\le r-1,
\]

contradicting \(\operatorname{rank}(A)=r\).

Therefore

\[
\boxed{
\operatorname{rank}(A)
=\text{minimum number of rank-1 pieces required to build }A.
}
\]

This is one of the cleanest bridges from abstract rank to something you can almost touch.

---

# Rank Factorization Meets SVD

A rank-\(r\) matrix also admits a rank factorization

\[
A=YZ^T,
\]

with

\[
Y\in\mathbb R^{m\times r},
\qquad
Z\in\mathbb R^{n\times r}.
\]

The columns of \(Y\) provide basic directions, while rows of \(Z^T\) provide coefficients for mixing them.

The inner dimension cannot be smaller than \(r\). If

\[
A=Y'Z'^T
\]

with only \(r'<r\) inner columns, then every column of \(A\) would lie in the span of the \(r'\) columns of \(Y'\), implying

\[
\operatorname{rank}(A)\le r'<r,
\]

which is impossible.

SVD is a special, highly structured rank factorization. In condensed form,

\[
A=U_r\Sigma_rV_r^T.
\]

One can group the first two factors:

\[
Y=U_r\Sigma_r,
\qquad
Z=V_r,
\]

so

\[
A=YZ^T.
\]

What SVD adds is orthonormality and a natural ordering by importance.

---

# When We Agree to Lose a Little

Exact decomposition is not always the goal.

Suppose

\[
A=
\sigma_1u_1v_1^T
+\sigma_2u_2v_2^T
+\sigma_3u_3v_3^T
+\cdots
\]

with

\[
\sigma_1\ge\sigma_2\ge\sigma_3\ge\cdots.
\]

If the later singular values are small, their layers contribute little.

So keep only the first \(k\) layers:

\[
\boxed{
A_k=
\sum_{i=1}^k
\sigma_i u_i v_i^T.
}
\]

Equivalently,

\[
\boxed{
A_k=U_k\Sigma_kV_k^T.
}
\]

This is the **truncated SVD**.

Its rank is at most \(k\), and when \(\sigma_k>0\), its rank is exactly \(k\).

Instead of storing all \(mn\) entries of an \(m\times n\) matrix, the factors require roughly

\[
k(m+n)+k
\]

numbers, depending on how the singular values are stored.

When

\[
k\ll m,n,
\]

that can be an enormous reduction.

[[interactive:low-rank-reconstruction]]

### Truncated SVD

```python
import numpy as np

U, s, Vt = np.linalg.svd(A, full_matrices=False)

k = 3
A_k = (U[:, :k] * s[:k]) @ Vt[:k, :]

error = np.linalg.norm(A - A_k, ord="fro")
tail_error = np.sqrt(np.sum(s[k:]**2))

print("Frobenius error:", error)
print("tail singular-value formula:", tail_error)
```

The two numbers agree up to numerical precision.



---

# How Much Did We Lose?

The most common matrix analogue of Euclidean distance is the Frobenius norm:

\[
\boxed{
\|M\|_F
=
\sqrt{\sum_{i,j}|m_{ij}|^2}.
}
\]

For an approximation \(B\) to \(A\), the error is

\[
\boxed{\|A-B\|_F.}
\]

Because the rank-1 SVD layers are mutually orthogonal under the Frobenius inner product, the truncated error has a beautiful formula:

\[
\boxed{
\|A-A_k\|_F^2
=
\sum_{i>k}\sigma_i^2.
}
\]

So the singular values do not merely order components; they tell us exactly how much Frobenius energy remains after truncation.

[[interactive:singular-spectrum]]

### Singular Values and Approximation Error

```python
import numpy as np

A = np.array([[3., 1.],
              [0., 2.],
              [2., 2.]])
U, s, Vt = np.linalg.svd(A, full_matrices=False)

k = 3
A_k = (U[:, :k] * s[:k]) @ Vt[:k, :]

error = np.linalg.norm(A - A_k, ord="fro")
tail_error = np.sqrt(np.sum(s[k:]**2))

print("Frobenius error:", error)
print("tail singular-value formula:", tail_error)
```

Optimal rank-\(k\) Frobenius error:

```python
import numpy as np
import matplotlib.pyplot as plt

A = np.array([[3., 1.],
              [0., 2.],
              [2., 2.]])
s = np.linalg.svd(A, compute_uv=False)

errors = []
for k in range(len(s) + 1):
    errors.append(np.sqrt(np.sum(s[k:]**2)))

plt.figure()
plt.plot(range(len(s)+1), errors, marker="o")
plt.xlabel("k")
plt.ylabel("||A - A_k||_F")
plt.title("Best rank-k approximation error")
plt.show()
```

---

# Why the First Pieces Are the Best

Here is the stronger statement.

For every matrix \(B\) with

\[
\operatorname{rank}(B)\le k,
\]

the truncated SVD satisfies

\[
\boxed{
\|A-A_k\|_F
\le
\|A-B\|_F.
}
\]

So \(A_k\) is not merely convenient.

It is the **best possible rank-\(k\) approximation** in Frobenius norm.

No clever alternative rank-\(k\) matrix can produce a smaller Frobenius error.

That is the Eckart–Young–Mirsky theorem in the Frobenius case.

Now let us prove it carefully.

---

# Why That Claim Is True

Assume

\[
A=U\Sigma V^T
\]

with singular values

\[
\sigma_1\ge\sigma_2\ge\cdots\ge0.
\]

Take any matrix \(B\) with rank at most \(k\).

## First move — project onto the row space of \(B\)

Let \(P\) be the orthogonal projector onto the row space of \(B\).

Because that row space has dimension at most \(k\),

\[
\operatorname{rank}(P)\le k.
\]

Every row of \(B\) already lies in that subspace, so

\[
B=BP.
\]

Now split the approximation error:

\[
A-B
=A(I-P)+(AP-B).
\]

The first part lives in the orthogonal complement of the projector; the second part lives inside the projector subspace. Those two pieces are Frobenius-orthogonal.

Therefore, by Pythagoras,

\[
\|A-B\|_F^2
=
\|A(I-P)\|_F^2
+
\|AP-B\|_F^2.
\]

Hence

\[
\boxed{
\|A-B\|_F^2
\ge
\|A(I-P)\|_F^2.
}
\]

So any rank-\(k\) approximation must at least pay the error of discarding whatever \(A\) places outside some \(k\)-dimensional row subspace.

## Second move — rewrite the retained energy

Since \(P\) and \(I-P\) are orthogonal complementary projectors,

\[
\|A\|_F^2
=
\|AP\|_F^2+\|A(I-P)\|_F^2.
\]

Thus minimizing the discarded energy is equivalent to maximizing

\[
\|AP\|_F^2.
\]

Now use the right singular vectors \(v_i\), which form an orthonormal basis. Since

\[
A^TA v_i=\sigma_i^2v_i,
\]

we can write

\[
\|AP\|_F^2
=
\operatorname{tr}(PA^TAP).
\]

Because \(P^2=P\) and trace is cyclic,

\[
\|AP\|_F^2
=
\operatorname{tr}(PA^TA).
\]

Expand in the eigenbasis \(v_i\):

\[
\|AP\|_F^2
=
\sum_i
\sigma_i^2\,\|Pv_i\|^2.
\]

Define

\[
\alpha_i=\|Pv_i\|^2.
\]

For an orthogonal projector,

\[
0\le\alpha_i\le1,
\]

and

\[
\sum_i\alpha_i=\operatorname{rank}(P)\le k.
\]

So we are distributing at most \(k\) units of weight among descending numbers

\[
\sigma_1^2\ge\sigma_2^2\ge\cdots.
\]

The largest possible weighted sum is achieved by placing full weight on the first \(k\):

\[
\|AP\|_F^2
\le
\sum_{i=1}^k\sigma_i^2.
\]

Therefore

\[
\|A(I-P)\|_F^2
=
\|A\|_F^2-\|AP\|_F^2
\ge
\sum_{i>k}\sigma_i^2.
\]

Combining with Step 1,

\[
\boxed{
\|A-B\|_F^2
\ge
\sum_{i>k}\sigma_i^2.
}
\]

But for the truncated SVD,

\[
A_k=\sum_{i=1}^k\sigma_iu_iv_i^T,
\]

and

\[
\|A-A_k\|_F^2
=
\sum_{i>k}\sigma_i^2.
\]

So equality is achieved by \(A_k\).

Therefore

\[
\boxed{
A_k\text{ is a best rank-}k\text{ approximation to }A.
}
\]

That is the theorem.

The deepest idea in the proof is not a trick with algebra. It is this:

> A rank-\(k\) approximation has room for only \(k\) independent directions. If you can keep only \(k\), the optimal choice is to keep the directions in which \(A\) carries the most squared magnitude—the directions belonging to the largest singular values.

---

# Where Do We Stop?

Suppose the singular values look like

\[
100,\ 80,\ 60,\ 1,\ 0.5,\ 0.1.
\]

There is a dramatic drop after the third value.

That suggests rank 3 may preserve most of the structure.

The trade-off is

\[
\boxed{
\text{smaller }k
\Rightarrow
\text{more compression, less fidelity}
}
\]

and

\[
\boxed{
\text{larger }k
\Rightarrow
\text{less compression, more fidelity}.
}
\]

A singular-value plot—often called a scree plot in related PCA contexts—makes this trade-off visible.

---

# And Then PCA Enters

Principal Component Analysis can seem like a completely new subject if it is introduced through statistics alone.

But once SVD is understood, PCA is almost a change of costume.

Suppose a data matrix has \(n\) observations arranged as rows and \(p\) features arranged as columns.

Call the centered data matrix

\[
X\in\mathbb R^{n\times p}.
\]

**Centered** means the mean of each feature column has been subtracted.

The sample covariance matrix is

\[
\boxed{
C=\frac1{n-1}X^TX.
}
\]

PCA finds eigenvectors of \(C\).

Now apply the SVD

\[
X=U\Sigma V^T.
\]

Then

\[
X^TX
=V\Sigma^TU^TU\Sigma V^T
=V\Sigma^T\Sigma V^T.
\]

Therefore

\[
C
=
V
\left(
\frac{\Sigma^T\Sigma}{n-1}
\right)
V^T.
\]

So the columns of \(V\) are exactly the PCA directions.

And the covariance eigenvalues are

\[
\boxed{
\lambda_i
=
\frac{\sigma_i^2}{n-1}.
}
\]

If one works with the unnormalized Gram matrix \(X^TX\) instead of the covariance matrix, then simply

\[
\lambda_i=\sigma_i^2.
\]

That is the precise bridge between PCA and SVD.


### PCA Directly from SVD

```python
import numpy as np

X = np.array([
    [2.5, 2.4], [0.5, 0.7], [2.2, 2.9], [1.9, 2.2], [3.1, 3.0],
    [2.3, 2.7], [2.0, 1.6], [1.0, 1.1], [1.5, 1.6], [1.1, 0.9],
])

# X: rows = observations, columns = features
X = np.asarray(X, dtype=float)

# 1. Center each feature
mean = X.mean(axis=0, keepdims=True)
Xc = X - mean

# 2. SVD of centered data
U, s, Vt = np.linalg.svd(Xc, full_matrices=False)

# Principal directions
components = Vt

# Principal-component scores
scores = Xc @ components.T
# equivalently: scores == U * s

# Covariance eigenvalues / explained variances
n = X.shape[0]
explained_variance = s**2 / (n - 1)
explained_ratio = explained_variance / explained_variance.sum()

print("components:\n", components)
print("explained variance:", explained_variance)
print("explained ratio:", explained_ratio)
```

# What Direction Is PCA Looking For?

The first principal component direction \(v_1\) is the unit direction in feature space along which the centered data has maximum variance.

The second direction \(v_2\) captures the maximum remaining variance subject to being perpendicular to \(v_1\).

Then \(v_3\), and so on.

SVD gives all of these directions at once:

\[
V=[v_1\ v_2\ \cdots].
\]

The singular values determine how much variation is carried in each direction.

The principal-component scores are

\[
XV.
\]

But from SVD,

\[
XV
=U\Sigma V^TV
=U\Sigma.
\]

Therefore

\[
\boxed{
\text{PCA scores}=U\Sigma.
}
\]

This is an extremely useful identity.

---

# Folding the Data into Fewer Directions

Keep only the top \(k\) principal directions:

\[
V_k=[v_1\ \cdots\ v_k].
\]

Project the centered data into the lower-dimensional coordinate system:

\[
Z=XV_k.
\]

The matrix \(Z\in\mathbb R^{n\times k}\) is the compressed representation.

Reconstruct back into feature space:

\[
\widehat X_k=ZV_k^T.
\]

Substitute \(Z=XV_k\):

\[
\widehat X_k=XV_kV_k^T.
\]

Using SVD,

\[
XV_k=U_k\Sigma_k,
\]

so

\[
\boxed{
\widehat X_k
=U_k\Sigma_kV_k^T
=X_k.
}
\]

Therefore, for centered data, PCA reconstruction using the top \(k\) directions is exactly the truncated SVD reconstruction.

This is the same low-rank approximation viewed through statistics rather than matrix factorization.

[[interactive:pca-projection]]

Reduce to \(k\) components:

```python
import numpy as np

X = np.array([
    [2.5, 2.4], [0.5, 0.7], [2.2, 2.9], [1.9, 2.2], [3.1, 3.0],
    [2.3, 2.7], [2.0, 1.6], [1.0, 1.1], [1.5, 1.6], [1.1, 0.9],
])
mean = X.mean(axis=0, keepdims=True)
Xc = X - mean
U, s, Vt = np.linalg.svd(Xc, full_matrices=False)
components = Vt
scores = Xc @ components.T

k = 1
Z = scores[:, :k]                  # compressed coordinates
Xc_reconstructed = Z @ components[:k, :]
X_reconstructed = Xc_reconstructed + mean
```

### Let PCA Move

For two-dimensional data:

```python
import matplotlib.pyplot as plt
import numpy as np

X = np.array([
    [2.5, 2.4], [0.5, 0.7], [2.2, 2.9], [1.9, 2.2], [3.1, 3.0],
    [2.3, 2.7], [2.0, 1.6], [1.0, 1.1], [1.5, 1.6], [1.1, 0.9],
])
mean = X.mean(axis=0, keepdims=True)
Xc = X - mean
U, s, Vt = np.linalg.svd(Xc, full_matrices=False)
components = Vt
explained_variance = s**2 / (X.shape[0] - 1)

plt.figure(figsize=(6, 6))
plt.scatter(Xc[:, 0], Xc[:, 1], alpha=0.5)

for i in range(2):
    direction = components[i]
    length = 2.5 * np.sqrt(explained_variance[i])
    plt.arrow(0, 0,
              length * direction[0],
              length * direction[1],
              width=0.02,
              length_includes_head=True)

plt.axhline(0)
plt.axvline(0)
plt.gca().set_aspect("equal", adjustable="box")
plt.title("PCA directions from the SVD")
plt.show()
```

---

# How Much of the Story Did We Keep?

Because

\[
\lambda_i=\frac{\sigma_i^2}{n-1},
\]

the explained variance ratio of component \(i\) is

\[
\boxed{
\frac{\lambda_i}{\sum_j\lambda_j}
=
\frac{\sigma_i^2}{\sum_j\sigma_j^2}.
}
\]

Notice the square.

For PCA variance accounting, the natural quantity is \(\sigma_i^2\), not \(\sigma_i\) itself.

If the first few squared singular values dominate the total, the dataset is approximately low-dimensional even if it has many original features.

---

# SVD and PCA, Side by Side

SVD and PCA are deeply related, but they are not the same concept.

**SVD** is a general matrix factorization. It can be applied to any matrix and produces left singular vectors, singular values, and right singular vectors.

**PCA** is a data-analysis procedure. It assumes an interpretation of rows and columns as observations and features, normally begins with mean-centering, and asks for directions of maximal variance.

For a centered data matrix, SVD is one of the cleanest computational routes to PCA.

A good mental summary is:

\[
\boxed{
\text{SVD is the matrix machinery; PCA is one important statistical use of it.}
}
\]

---

# SVD in Images: When Low Rank Becomes Visible

Until now, approximation has looked like symbols moving on paper. An image lets us see the loss.

[[interactive:image-svd-compression]]





A grayscale image with \(m\) rows and \(n\) columns is simply a matrix

\[
A\in\mathbb R^{m\times n},
\]

whose entries are pixel intensities. Once the image is a matrix, the entire SVD story applies:

\[
A=\sum_{i=1}^{r}\sigma_i u_i v_i^T.
\]

Each \(\sigma_i u_iv_i^T\) is an image-sized rank-1 pattern. Do not expect the first layer to mean “the eye” and the second to mean “the tree.” These are mathematical separable patterns, not semantic segmentation.

Keep only the first \(k\) layers and we get

\[
A_k=U_k\Sigma_kV_k^T.
\]

With small \(k\), broad structure appears first; finer detail returns as \(k\) grows. The retained energy is

\[
\boxed{
E_k=
\frac{\sum_{i=1}^{k}\sigma_i^2}
     {\sum_{i=1}^{r}\sigma_i^2}.
}
\]

The original image stores \(mn\) values. A rank-\(k\) representation stores roughly

\[
k(m+n+1)
\]

values when we keep \(U_k\), \(\Sigma_k\), and \(V_k^T\). That explains the mathematics of compression, but not the full engineering of JPEG or WebP, which also involves quantization, entropy coding, and other design choices.

For an RGB image, the simplest demonstration is to decompose the red, green, and blue channel matrices separately and stack them back together after truncation.

The value of this example is larger than “image compression.” It gives Eckart–Young a face: remove mathematical directions, reconstruct the matrix, and look directly at what disappeared.


### Image Compression with SVD

```python
from PIL import Image
import numpy as np

img = Image.open("your_image.jpg").convert("L")
A = np.asarray(img, dtype=float)

U, s, Vt = np.linalg.svd(A, full_matrices=False)

k = 40
A_k = (U[:, :k] * s[:k]) @ Vt[:k, :]
A_k = np.clip(A_k, 0, 255).astype(np.uint8)

Image.fromarray(A_k).save("compressed_rank_40.png")
```

Try several values of \(k\) and compare visual quality with the Frobenius error.

# Foreshadowing — SVD Inside Neural Networks

This report will not become a chapter on neural-network compression. But one bridge is worth opening because the mathematics is exactly the same.

[[interactive:neural-network-svd]]

A fully connected layer begins with

\[
y=Wx+b.
\]

Ignore the activation for a moment and look only at \(W\). It is a matrix, so

\[
W=U\Sigma V^T.
\]

If the singular values decay quickly, we can use

\[
W\approx U_k\Sigma_kV_k^T,
\]

which turns the layer into

\[
y\approx U_k\Sigma_kV_k^Tx+b.
\]

Instead of one large linear map, think of two smaller ones:

\[
x
\xrightarrow{V_k^T}
\text{a }k\text{-dimensional representation}
\xrightarrow{U_k\Sigma_k}
\text{the original output dimension}.
\]

If \(W\in\mathbb R^{m\times n}\), the original layer carries \(mn\) weights, while the two factors need roughly

\[
k(m+n).
\]

When \(k\ll m,n\), the difference can be large.

One detail matters: if the two factors are replacing one linear map, do **not** place a nonlinearity between them, or the product is no longer the same rank-\(k\) linear approximation.

This also explains the connection to PCA. PCA asks whether the activations really need all their directions; SVD on the weights asks whether the weight matrix itself needs all of its directions.

The uploaded VGG19 compression report uses exactly this bridge: PCA to inspect activation-space redundancy, then truncated SVD on dense classifier weights, replacing a large matrix with two smaller linear factors (Ahmed et al., 2026). We stop here on purpose. The rest belongs to the compression story, not this mountain.

---

# Numerical Exploration

The formulas

\[
\sigma_i=\sqrt{\lambda_i(A^TA)}
\]

and

\[
u_i=\frac{Av_i}{\sigma_i}
\]

are excellent for understanding.

But in numerical software, explicitly forming \(A^TA\) can worsen conditioning because the condition number is effectively squared. Robust library SVD routines therefore use more stable algorithms rather than literally computing SVD by first forming \(A^TA\).

So keep two questions separate. If you are asking *where SVD comes from*, \(A^TA\) is a beautiful conceptual doorway. If you are asking *how to compute SVD in real numerical work*, use a trusted routine such as `numpy.linalg.svd`, `scipy.linalg.svd`, MATLAB `svd`, or the corresponding high-quality routine in your environment. Understanding and implementation are related, but they are not identical.

---

# Small Ambiguities, Same Story

The singular values are uniquely determined.

The singular vectors have some freedom.

If

\[
\sigma_i u_i v_i^T
\]

is one SVD layer, then

\[
\sigma_i(-u_i)(-v_i)^T
=
\sigma_i u_i v_i^T.
\]

So both vectors may flip sign together without changing \(A\).

If a singular value is repeated, such as

\[
\sigma_1=\sigma_2,
\]

then the associated two-dimensional singular subspace is fixed, but the particular orthonormal basis chosen inside that subspace need not be unique.

This is why two software packages may return singular vectors with different signs—or different bases inside a repeated-value subspace—while both answers are mathematically correct.

---

# Four Spaces in One Frame

For a rank-\(r\) matrix

\[
A=U\Sigma V^T,
\]

partition the singular vectors into nonzero and zero parts.

The right singular vectors associated with nonzero singular values span the row space:

\[
\operatorname{Row}(A)=\operatorname{span}(v_1,\ldots,v_r).
\]

The remaining right singular vectors span the null space:

\[
\mathcal N(A)=\operatorname{span}(v_{r+1},\ldots,v_n).
\]

The left singular vectors associated with nonzero singular values span the column space:

\[
\operatorname{Col}(A)=\operatorname{span}(u_1,\ldots,u_r).
\]

The remaining left singular vectors span the left null space:

\[
\mathcal N(A^T)=\operatorname{span}(u_{r+1},\ldots,u_m).
\]

So SVD does not merely factor a matrix. It organizes the four fundamental subspaces into orthonormal bases.

This is one reason SVD feels like a grand finale of linear algebra: rank, row space, column space, null spaces, eigenvectors, orthogonality, approximation, and data analysis all meet in one construction.

---

# What Does One Layer Carry?

The component

\[
\sigma_i u_i v_i^T
\]

can be read from three directions:

**Transformation view**

\[
v_i\xrightarrow{A}\sigma_i u_i.
\]

**Rank-1 layer view**

\[
\sigma_i u_iv_i^T
\]

is one rank-1 piece of the matrix.

**Data view**

Here \(v_i\) is a direction on the feature side, \(u_i\sigma_i\) carries the observation-side scores along that direction, and \(\sigma_i^2\) determines how much variance that component accounts for when SVD is used to perform PCA on centered data.

These are not three separate theories. They are three readings of the same algebra.

---

# The Whole Map

The entire story can be compressed into this chain:

[[interactive:concept-map]]

\[
\boxed{
\text{composition}
\rightarrow
\text{decomposition}
\rightarrow
\text{structured factors}
}
\]

then

\[
\boxed{
\text{column space}
\rightarrow
\text{rank}
\rightarrow
\text{rank-1 pieces}
}
\]

then

\[
\boxed{
A=U\Sigma V^T
\rightarrow
Av_i=\sigma_i u_i
}
\]

then

\[
\boxed{
A=
\sum_i\sigma_i u_iv_i^T
}
\]

then

\[
\boxed{
\text{keep top }k
\rightarrow
A_k=U_k\Sigma_kV_k^T
}
\]

then

\[
\boxed{
A_k
=\text{best rank-}k\text{ approximation}
}
\]

and finally, for centered data,

\[
\boxed{
\text{PCA directions}=\text{right singular vectors}
}
\]

with

\[
\boxed{
\text{explained variance}_i
=\frac{\sigma_i^2}{n-1}.
}
\]

---

# If One Sentence Survives

If all notation disappears tomorrow, keep this:

> **SVD finds special orthogonal input directions that a matrix transforms independently into special orthogonal output directions, tells us the strength of each transformation with singular values, and orders those directions so that the strongest ones give the optimal low-rank description of the matrix.**

That sentence contains the geometry, the rank-1 decomposition, low-rank approximation, and the bridge to PCA.

---

# The Neighbors We Passed

The main report concentrates on SVD, but the broader decomposition notes contain several useful neighboring constructions.

## LU

\[
A=LU
\]

with \(L\) lower triangular and \(U\) upper triangular. With pivoting,

\[
PA=LU.
\]

LU is Gaussian elimination stored as a factorization.

## QR

\[
A=QR,
\]

where \(Q\) has orthonormal columns and \(R\) is upper triangular. It is central to least squares and numerical linear algebra.

## Cholesky

For symmetric positive-definite \(A\),

\[
A=LL^T.
\]

It exploits symmetry and positivity and is widely used in statistics, optimization, and numerical methods.

## Spectral Decomposition

For real symmetric \(A\),

\[
A=Q\Lambda Q^T.
\]

This is closely connected to SVD: symmetric positive-semidefinite matrices already possess the orthogonal-diagonal-orthogonal structure with one common eigenbasis.

## Jordan

For a square matrix,

\[
A=PJP^{-1}.
\]

Jordan form reveals generalized eigenvector structure and is extremely important theoretically, though it is numerically sensitive.

## Schur

For a complex square matrix,

\[
A=QTQ^*,
\]

with \(Q\) unitary and \(T\) upper triangular. It is more numerically stable than Jordan form and exposes eigenvalues on the diagonal.

## Real Schur

For real matrices,

\[
A=QTQ^T,
\]

where \(T\) is quasi-upper-triangular and may contain \(2\times2\) blocks representing complex-conjugate eigenvalue pairs.

## Polar

\[
A=QH,
\]

where \(Q\) is orthogonal/unitary and \(H\) is positive semidefinite.

If

\[
A=U\Sigma V^T,
\]

then one polar factorization is

\[
Q=UV^T,
\qquad
H=V\Sigma V^T
\]

in an appropriate square/full-rank setting, with standard extensions for rectangular matrices.

## Block LU

For a block matrix

\[
A=
\begin{bmatrix}
A_{11}&A_{12}\\
A_{21}&A_{22}
\end{bmatrix},
\]

one can perform elimination at the level of blocks, introducing the Schur complement

\[
S=A_{22}-A_{21}A_{11}^{-1}A_{12}.
\]

This is important in large structured systems and scientific computing.

## Interpolative Decomposition

\[
A\approx CX,
\]

where \(C\) contains selected actual columns of \(A\). Unlike SVD, which constructs mathematically optimal directions that may be mixtures of many columns, interpolative decomposition can offer stronger interpretability because the basis elements are real columns from the data.

## Algebraic Polar and Mostow

These are more specialized constructions appearing in advanced matrix analysis and geometry. They continue the same broad theme: separate a complicated matrix into factors with special algebraic or geometric structure.

The recurring question never changes:

\[
\boxed{
\text{Can we choose a representation in which the matrix becomes easier to understand?}
}
\]
# From the Summit

Looking from the summit toward the horizon is beautiful. From there, SVD can make everything look as if it arrived at once: clean directions, scaling, rank-1 layers, low-rank approximation, then PCA, images, and even a glimpse of neural networks.

But the summit hides the path that built it. We began with pieces we knew and composed them; then we reversed the question and started decomposing. Layer by layer, the mountain became visible.

> **Looking from the summit toward the horizon is beautiful, but all we really needed was a leap of faith to look down and see what this mountain was made of.**

# References

Andrews, H. C., & Patterson, C. L. (1976). Singular value decomposition (SVD) image coding. *IEEE Transactions on Communications, 24*(4), 425–432. [https://doi.org/10.1109/TCOM.1976.1093309](https://doi.org/10.1109/TCOM.1976.1093309)

Brain Station Advanced. (n.d.). *No one taught SVD (singular value decomposition) like this* [Video]. YouTube. [https://youtu.be/llisH02KLrE](https://youtu.be/llisH02KLrE)

Ahmed, E. E., Kamel, A. M., Ahmed, M., & Amir, M. (2026). *Statistical compression of VGG19 for blood-cell image classification on BloodMNIST* [Unpublished project report]. Cairo University.

Denton, E. L., Zaremba, W., Bruna, J., LeCun, Y., & Fergus, R. (2014). Exploiting linear structure within convolutional networks for efficient evaluation. In *Advances in neural information processing systems* (Vol. 27, pp. 1269–1277). [https://proceedings.neurips.cc/paper/2014/hash/1adaeb993eba95859121a43ea61bd858-Abstract.html](https://proceedings.neurips.cc/paper/2014/hash/1adaeb993eba95859121a43ea61bd858-Abstract.html)

*Existence of the singular value decomposition (SVD): A very detailed step-by-step explanation.* (n.d.). [Unpublished study notes].

Jaderberg, M., Vedaldi, A., & Zisserman, A. (2014). Speeding up convolutional neural networks with low rank expansions. In *Proceedings of the British Machine Vision Conference 2014*. [https://doi.org/10.5244/C.28.88](https://doi.org/10.5244/C.28.88)

*Matrix decompositions: Cohesive summary.* (n.d.). [Unpublished study notes].

MIT OpenCourseWare. (n.d.-a). *Singular value decomposition* [Video]. YouTube. [https://youtu.be/TX_vooSnhm8](https://youtu.be/TX_vooSnhm8)

MIT OpenCourseWare. (n.d.-b). *Singular value decomposition (the SVD)* [Video]. YouTube. [https://youtu.be/mBcLRGuAFUk](https://youtu.be/mBcLRGuAFUk)

Sainath, T. N., Kingsbury, B., Sindhwani, V., Arisoy, E., & Ramabhadran, B. (2013). Low-rank matrix factorization for deep neural network training with high-dimensional output targets. In *2013 IEEE International Conference on Acoustics, Speech and Signal Processing* (pp. 6655–6659). [https://doi.org/10.1109/ICASSP.2013.6638949](https://doi.org/10.1109/ICASSP.2013.6638949)

*SVD, matrix rank, low-rank approximation, PCA, and the existence proof: A detailed, intuitive, step-by-step study guide.* (n.d.). [Unpublished study notes].

Visual Kernel. (n.d.). *SVD visualized, singular value decomposition explained | SEE Matrix, chapter 3* [Video]. YouTube. [https://youtu.be/vSczTbgc8Rc](https://youtu.be/vSczTbgc8Rc)
