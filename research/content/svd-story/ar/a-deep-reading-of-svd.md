# قراءة معمقة في SVD
## قمة الجبل

قد يبدو الحديث عن **SVD** في عالم الجبر الخطي كالقفز مباشرةً إلى قمة جبل. لماذا نبدأ من أعلى النظرية قبل أن نعرف الطريق إليها؟

لا تقلق. لن نحفظ القمة ولن نضيع وسط متاهات البراهين. سنفعل شيئًا أبسط: سنقف فوقها قليلًا، ثم نبدأ في تفكيكها حتى نرى ممَّا تكوَّن الجبل.

# من التجميع إلى التفكيك

وبما أننا نتحدث عن **التفكيك — Decomposition**، فلنبدأ من الاتجاه المعاكس: **التجميع — Composition**.

أمامنا ثلاث مصفوفات، \(A\) و\(B\) و\(C\). أبعادها متوافقة، ولذلك نستطيع أن نصلها ببعضها:

\[
W=ABC.
\]

هذه هي الفكرة في أبسط صورة: نعرف القطع، نجمعها، فيظهر شيء جديد. وإذا دخل متجه \(x\) إلى هذه السلسلة فإن العمل يبدأ من اليمين: \(Wx=ABCx=A(B(Cx))\)، أي

\[
x\xrightarrow{C}Cx\xrightarrow{B}BCx\xrightarrow{A}ABCx.
\]

لنأخذ مثالًا صغيرًا:

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

وعند جمع هذه التحويلات نحصل على

\[
W=ABC=
\begin{bmatrix}
1&-2\\
\tfrac12&0
\end{bmatrix}.
\]

[[interactive:composition-three-matrices]]

### التجميع في Python

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

هذا هو الاتجاه السهل في القصة: القطع معروفة، ولذلك نبني منها المصفوفة النهائية.



هنا **تلمس التجميع** بدل أن تقرأ تعريفه فقط. غيّر \(x\)، واضغط على المصفوفات، وراقب كيف تمر المتجهة من \(C\) إلى \(B\) ثم إلى \(A\).

والآن اقلب السؤال: بدل أن أعطيك القطع، أضع أمامك مصفوفة واحدة اسمها \(D\). نرى صفوفها وأعمدتها، ونستطيع أن نحسب رتبتها وكل ما يظهر لنا منها. ثم أقول لك: **افتحها. أرني البنية التي تختبئ في داخلها.**

لو لم تكن لدينا أدوات، لاستطعنا التخمين حتى تحترق النجوم. لكن هذا بالضبط هو السبب الذي جعل علماء الجبر الخطي يبنون نظريات الـdecomposition: لا نريد أي عوامل عشوائية؛ نريد قطعًا لها معنى وبنية نستطيع الاستفادة منها.

قد تكون القطع مثلثية كما في **LU**، أو اتجاهات orthonormal ومعاملات مثلثية كما في **QR**، أو عاملًا مثلثيًا وانعكاسه كما في **Cholesky**. وقد نغيّر زاوية النظر نفسها كما في **Spectral decomposition** و**Schur**، أو نفصل الدوران عن التمدد كما في **Polar decomposition**. ثم نصل إلى **SVD**، الذي سيأخذ المسرح من هنا.

## أطلس التفكيك

الأسماء كثيرة، لكن الفكرة واحدة: لا تقاتل المصفوفة بالشكل الذي وصلت به إليك. ابحث عن تمثيل يجعل عمل كل قطعة واضحًا.

في العنصر التالي اختر LU أو QR أو Cholesky أو Spectral أو SVD. افتح العوامل، ثم أعد بناء المصفوفة الأصلية. لا تحفظ الصيغ؛ راقب النمط وهو يتكرر.

[[interactive:decomposition-gallery]]

### أطلس تفكيك صغير في Python

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

وباستخدام SciPy يمكن حساب بعض التفكيكات مباشرة:

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

ومن هنا لا يعود SVD قفزة غريبة. أصبح مجرد التفكيك الذي سنقترب منه أكثر من أي تفكيك آخر.

---

# الجوهر فقط

لأي مصفوفة حقيقية \(A\in\mathbb R^{m\times n}\)، يمكننا كتابة

\[
\boxed{A=U\Sigma V^T}.
\]

في الصورة الكاملة يكون \(U\) مصفوفة متعامدة من الحجم \(m\times m\)، و\(V\) مصفوفة متعامدة من الحجم \(n\times n\)، بينما \(\Sigma\) مصفوفة قطرية مستطيلة من الحجم \(m\times n\).

على قطر \(\Sigma\) توجد القيم المفردة:

\[
\sigma_1\ge\sigma_2\ge\cdots\ge0.
\]

أعمدة \(V\) هي **right singular vectors**، وأعمدة \(U\) هي **left singular vectors**. ولو كانت العناصر مركبة نستبدل \(T\) بالـconjugate transpose \(^*\).

[[interactive:svd-three-factors]]

هذه هي الصيغة. أمّا المعنى فيظهر عندما نرى وظيفة كل قطعة.


### احسب SVD وتحقق منه

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

ولمصفوفة مستطيلة استخدم

```python
import numpy as np

A = np.array([[3., 1.],
              [1., 2.]])
U, s, Vt = np.linalg.svd(A, full_matrices=False)
```

إذا كانت نسخة compact/economy هي كل ما تحتاجه.

---

# من اليمين تبدأ الحكاية

إذا أدخلنا متجهة \(x\)، فلدينا \(Ax=U\Sigma V^Tx\).

ابدأ من \(V^T\). هذه القطعة لا “تشوّه” المتجهة كيفما اتفق؛ هي تسأل: كم تحتوي \(x\) من كل اتجاه خاص \(v_i\)؟ فعلًا، إذا كتبنا \(V=[v_1\ v_2\ \cdots\ v_n]\)، فإن

\[
V^Tx=
\begin{bmatrix}
v_1^Tx\\
v_2^Tx\\
\vdots
\end{bmatrix}.
\]

إذن \(V^T\) يحلل المدخل في إحداثيات صُممت خصيصًا لهذه المصفوفة.

ثم تصل الإحداثيات إلى \(\Sigma\). لا توجد هنا مزاوجة معقدة بين المحاور؛ كل اتجاه يُضرب في رقم واحد:

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

وهنا تكمن بساطة SVD: التحويل المعقد صار في هذه الإحداثيات مجرد **stretch/shrink** مستقل لكل محور.

وأخيرًا تأتي \(U\) لتضع هذه المركبات بعد تمددها في اتجاهاتها المناسبة داخل فضاء الخرج.

لذلك يمكن أن نحفظ القصة لا الحروف:

\[
\boxed{
V^T\longrightarrow\Sigma\longrightarrow U
}
\]

يحلّل (V^T) المدخل، ثم تمدّد (Sigma) مركباته أو تقلّصها، وأخيرًا يوجّه (U) الخرج.

والجملة التي تختصر كل ذلك هي

\[
\boxed{Av_i=\sigma_i u_i.}
\]

أدخل الاتجاه الخاص \(v_i\)، فتخرج في اتجاه \(u_i\) بعد أن يتغير طولها بمقدار \(\sigma_i\).

---

# سر الجمال

هنا يظهر أول سبب يجعل SVD جميلًا: الـeigendecomposition التقليدي يريد مصفوفة مربعة، لأن معادلة

\[
Av=\lambda v
\]

تحتاج أن يعيش \(v\) و\(Av\) في الفضاء نفسه.

لكن إذا كانت \(A:\mathbb R^n\to\mathbb R^m\) و\(m\neq n\)، فليس هناك سبب لأن يكون فضاء المدخل هو فضاء الخرج.

SVD لا يحاول إجبار الفضاءين على أن يكونا واحدًا. يعطي المدخل أساسه الخاص \(V\)، ويعطي الخرج أساسه الخاص \(U\). هذا ليس حلًا التفافيًا للمشكلة؛ هذه هي الفكرة التي تجعل SVD طبيعيًا للمصفوفات المستطيلة.

---

# حين تتحول الدائرة

تخيل دائرة الوحدة في بعدين. كل نقطة عليها تمثل متجهة طولها واحد. عندما نطبّق \(V^T\)، تتغير الإحداثيات دون أن تتغير الأطوال لأن \(V\) orthogonal. ثم تأتي \(\Sigma\) فتمد محورًا أكثر من الآخر، فتحول الدائرة إلى ellipse. بعدها تدور \(U\) النتيجة أو تعكسها لتضعها في الاتجاه النهائي.

[[interactive:svd-geometry]]

### دع الهندسة تتحرك

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

للتعليم من الأفضل متابعة `circle` ثم `after_vt` ثم `after_sigma` ثم `after_u` مرحلةً بعد مرحلة. وفي النسخة التفاعلية نتابع الجسم نفسه وهو يتغير بدل الاعتماد على صور منفصلة.



لهذا يقال كثيرًا إن SVD هو “دوران/انعكاس، ثم تمدد، ثم دوران/انعكاس”. العبارة مفيدة، لكن النسخة الأدق هي أن \(V^T\) يختار نظام إحداثيات المدخل، و\(\Sigma\) يقوم بالفعل المستقل على كل محور، و\(U\) يختار نظام إحداثيات الخرج.

---

# من أين تأتي هذه القطع؟

الآن وصلنا إلى سؤال مهم: هل اخترعنا هذه الاتجاهات لأنها تبدو جميلة؟ لا. ابدأ من المعادلة \(Av_i=\sigma_i u_i\).

اضرب من اليسار بـ\(A^T\):

\[
A^TAv_i=\sigma_i A^Tu_i.
\]

وفي SVD نحصل أيضًا على \(A^Tu_i=\sigma_i v_i\)، إذن \(A^TAv_i=\sigma_i^2v_i\).

ها هو السر: الـright singular vectors هي eigenvectors للمصفوفة \(A^TA\)، ومربعات singular values هي eigenvalues لها.

وبالمثل \(AA^Tu_i=\sigma_i^2u_i\)، فتكون left singular vectors eigenvectors لـ\(AA^T\).

وهذا يفسر لماذا القيم المفردة غير سالبة: \(A^TA\) موجبة شبه محددة، وبالتالي eigenvalues الخاصة بها غير سالبة، ثم نأخذ الجذر \(\sigma_i=\sqrt{\lambda_i}\).

---

# أول خيط: \(A^TA\)

إذا أردت أن تبني SVD للتعلم لا للحساب العددي الاحترافي، ابدأ بـ\(A^TA\). استخرج eigenvectors متعامدة معيارية \(v_i\) ورتب eigenvalues تنازليًا. من كل eigenvalue \(\lambda_i\) اصنع

\[
\sigma_i=\sqrt{\lambda_i}.
\]

وحين تكون \(\sigma_i\neq0\)، مرر \(v_i\) داخل \(A\)، ثم اقسم على مقدار التمدد:

\[
u_i=\frac{Av_i}{\sigma_i}.
\]

بهذه الطريقة لا نسحب \(U\) و\(\Sigma\) و\(V\) من قبعة ساحر. \(A^TA\) تخبرنا بالاتجاهات المهمة في فضاء المدخل، eigenvalues تخبرنا بقوة التمدد، و\(A\) نفسها تخبرنا أين تصل هذه الاتجاهات في فضاء الخرج.

هذا الطريق ممتاز للفهم. أما في العمل العددي الحقيقي فسنعتمد على خوارزميات SVD مستقرة مباشرة بدل تكوين \(A^TA\) دائمًا، لأن تربيع condition number قد يزيد المشكلات العددية.


### ابنِ SVD من \(A^TA\)

هذا مفيد لفهم النظرية. أما في العمل العددي الحقيقي فالأفضل استخدام `np.linalg.svd` مباشرة.

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

# برهان الوجود

## ما الذي نريد إثباته فعلًا؟

حتى الآن عرفنا كيف نفهم SVD وكيف نبنيه بطريقة تعليمية. لكن تبقى قفزة مهمة: لماذا نضمن أن كل مصفوفة تملك SVD أصلًا؟

لنفترض \(A\in\mathbb C^{m\times n}\)، و\(r=\operatorname{rank}(A)\).

نريد أن نثبت وجود صيغة condensed SVD:

\[
\boxed{A=X\Sigma_rY^*},
\]

بحيث أعمدة \(X\) وأعمدة \(Y\) orthonormal، و

\[
\Sigma_r=
\operatorname{diag}(\sigma_1,\ldots,\sigma_r),
\qquad
\sigma_1\ge\cdots\ge\sigma_r>0.
\]

إذا كانت الرموز المركبة مزعجة، تذكر فقط أن \(A^*=A^T\) في الحالة الحقيقية.

الأداة التي سنستعملها هي **spectral theorem**: كل مصفوفة Hermitian تملك أساسًا orthonormal من eigenvectors، ويمكن كتابتها في صورة

\[
W=Z\Lambda Z^*.
\]

المشكلة الوحيدة أن \(A\) قد لا تكون مربعة ولا Hermitian. إذن بدل أن نحاول إجبار \(A\) على شيء ليست عليه، سنبني مصفوفة أكبر تحمل \(A\) داخلها.

---

# الحيلة التي تفتح الباب

عرّف

\[
\boxed{
W=
\begin{bmatrix}
0&A\\
A^*&0
\end{bmatrix}.
}
\]

حجمها \((m+n)\times(m+n)\)، فهي مربعة. والأهم أن \(W^*=W\)، إذن \(W\) Hermitian، وبالتالي spectral theorem مفتوح لنا.

خذ eigenvector لـ\(W\) واكتبه على قطعتين:

\[
z=
\begin{bmatrix}
x\\y
\end{bmatrix},
\qquad
Wz=\sigma z.
\]

بتوسيع الضرب الكتلي نحصل على

\[
\begin{bmatrix}
Ay\\A^*x
\end{bmatrix}
=
\begin{bmatrix}
\sigma x\\\sigma y
\end{bmatrix}.
\]

أي \(Ay=\sigma x\) و\(A^*x=\sigma y\).

انظر إلى أول معادلة. إنها تقريبًا التعريف الذي كنا نبحث عنه: \(y\) يتصرف كـright singular vector، و\(x\) كـleft singular vector، و\(\sigma\) كـsingular value.

[[interactive:svd-existence-proof-map]]

### افحص برهان الـblock matrix عدديًا

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

هذه التجربة العددية تعرض ما يتنبأ به البرهان تمامًا:

\[
\operatorname{spec}(W)
=
\{-\sigma_i,0,+\sigma_i\}.
\]



هذه هي الحيلة المركزية للبرهان كله: نحول مشكلة SVD لمصفوفة ربما تكون مستطيلة إلى eigenvalue problem لمصفوفة Hermitian أكبر.

---

# لماذا تأتي القيم أزواجًا؟

إذا كان

\[
\begin{bmatrix}x\\y\end{bmatrix}
\]

eigenvector بقيمة \(+\sigma\)، فانظر إلى

\[
\begin{bmatrix}x\\-y\end{bmatrix}.
\]

باستخدام \(Ay=\sigma x\) و\(A^*x=\sigma y\) نجد

\[
W
\begin{bmatrix}x\\-y\end{bmatrix}
=-\sigma
\begin{bmatrix}x\\-y\end{bmatrix}.
\]

إذن القيم غير الصفرية تأتي في أزواج \(+\sigma_i,-\sigma_i\).

وبما أن \(W\) Hermitian، فإن eigenvectors المرتبطة بقيم eigenvalues مختلفة يمكن اختيارها متعامدة. هذه المعلومة هي التي ستعطينا لاحقًا orthonormality للاتجاهات المفردة.

---

# نجمع القطع

نختار

\[
z_i=
\begin{bmatrix}x_i\\y_i\end{bmatrix}
\]

بحيث يكون \(z_i^*z_i=2\).

قد يبدو الرقم 2 غريبًا، لكنه مقصود: نريد في النهاية أن يكون لكل من \(x_i\) و\(y_i\) طول يساوي 1.

لدينا \(x_i^*x_i+y_i^*y_i=2\).

ومن تعامد eigenvector المرتبط بـ\(+\sigma_i\) مع النظير المرتبط بـ\(-\sigma_i\) نحصل على

\[
x_i^*x_i-y_i^*y_i=0.
\]

نجمع المعادلتين فنحصل على \(x_i^*x_i=1\)، ونطرحهما فنحصل على \(y_i^*y_i=1\).

الآن نجمع المتجهات في مصفوفتين:

\[
X=[x_1\ \cdots\ x_r],
\qquad
Y=[y_1\ \cdots\ y_r],
\]

ونضع القيم المفردة في \(\Sigma_r=\operatorname{diag}(\sigma_1,\ldots,\sigma_r)\).

وباستخدام spectral decomposition للمصفوفة \(W\)، ثم ضرب الكتل ومقارنة الجزء العلوي الأيمن، نحصل على ما أردناه:

\[
\boxed{A=X\Sigma_rY^*.}
\]

---

# لماذا تبقى الاتجاهات نظيفة؟

وحدة الطول حصلنا عليها بالفعل. بقي أن نثبت أن الأعمدة المختلفة متعامدة.

لـ\(i\neq j\)، تعامد eigenvectors لـ\(W\) يعطينا

\[
x_i^*x_j+y_i^*y_j=0.
\]

وعندما نقارن eigenvector الموجب للأول مع النظير ذي الإشارة السالبة للثاني نحصل على

\[
x_i^*x_j-y_i^*y_j=0.
\]

اجمع المعادلتين: \(2x_i^*x_j=0 \Longrightarrow x_i^*x_j=0\). واطرحهما: \(2y_i^*y_j=0 \Longrightarrow y_i^*y_j=0\). وهكذا \(X^*X=I_r\) و\(Y^*Y=I_r\).

لم نعد نملك حدسًا فقط. لقد أثبتنا وجود الـcondensed SVD.

---

# البرهان في نفس واحد

إذا ضاعت التفاصيل، لا تحفظ الصفحات. احفظ الحركة.

نبدأ بـ\(A\)، ثم نخفيها داخل

\[
W=
\begin{bmatrix}
0&A\\A^*&0
\end{bmatrix}.
\]

\(W\) Hermitian، لذلك تعطينا spectral theorem eigenvectors متعامدة معيارية. نقسم كل eigenvector إلى جزأين \(x_i\) و\(y_i\)، فتخرج لنا المعادلتان

\[
Ay_i=\sigma_i x_i,
\qquad
A^*x_i=\sigma_i y_i.
\]

نجمع \(x_i\) في \(X\)، و\(y_i\) في \(Y\)، والقيم \(\sigma_i\) في \(\Sigma_r\)، فنستعيد

\[
\boxed{A=X\Sigma_rY^*.}
\]

الـsingular vectors لم تظهر من العدم. كانت مختبئة داخل eigenvectors لمصفوفة Hermitian صممناها بعناية.

---

# من حاصل ضرب إلى طبقات

حتى الآن رأينا SVD كآلة من ثلاث مراحل. الآن سنديرها قليلًا لنرى صورة ثانية لا تقل أهمية. اكتب \(U=[u_1\ u_2\ \cdots]\) و\(V=[v_1\ v_2\ \cdots]\).

لأن \(\Sigma\) قطرية، يمكن فتح حاصل الضرب إلى مجموع:

\[
\boxed{
A=
\sum_{i=1}^{\min(m,n)}
\sigma_i u_i v_i^T.
}
\]

كل \(u_iv_i^T\) مصفوفة rank-1، لأن كل أعمدتها مضاعفات عددية من \(u_i\).

إذن SVD يقول شيئًا مدهشًا وبسيطًا في الوقت نفسه:

> **المصفوفة طبقات rank-1 مرتبة من الأقوى إلى الأضعف.**

[[interactive:rank1-layers]]

### انظر إلى المصفوفة

حتى heatmap بسيطة للمصفوفة قد تكفي لكي تصبح البنية مرئية:

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

استعمل العرض نفسه كسرد متصل: ابدأ بالمصفوفة الأصلية \(A\)، ثم اعزل طبقة rank-1، ثم اعرض truncated reconstruction \(A_k\)، وفي النهاية انظر إلى residual \(A-A_k\). هكذا يصبح matrix decomposition شيئًا نراه يتحرك بدل أن يكون مجرد رموز.


### اسحب طبقات rank-1 واحدةً واحدة

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

كل `layer_i` رتبتها لا تتجاوز 1.

ولعرض إحدى الطبقات:

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

القيمة \(\sigma_i\) هي قوة الطبقة. إذا كانت صفرًا، فالطبقة لا تضيف شيئًا. ومن هنا نحصل على حقيقة مهمة:

\[
\boxed{
\operatorname{rank}(A)
=
\#\{i:\sigma_i\ne0\}.
}
\]

---

# كم قطعة نحتاج؟

يمكن أيضًا فهم rank من زاوية البناء. إذا كانت

\[
\operatorname{rank}(A)=k,
\]

فيمكن بناء \(A\) من \(k\) قطع rank-1، ولا يمكن فعل ذلك باستخدام \(k-1\) قطع rank-1 فقط.

هذه ليست مجرد صورة جميلة؛ إنها تعيد تفسير معنى الرتبة نفسه: كم اتجاهًا مستقلًا نحتاج حتى نبني المصفوفة؟

وهذا يقود طبيعيًا إلى rank factorization. إذا

\[
A=YZ^T
\]

وكان لـ\(Y\) عدد \(k\) من الأعمدة، فإن كل أعمدة \(A\) تعيش داخل span لتلك الأعمدة، ولذلك

\[
\operatorname{rank}(A)\le k.
\]

إذا كانت rank الفعلية تساوي \(r\)، فلن تستطيع ضغط البعد الداخلي تحت \(r\) مع الحفاظ على المساواة التامة.

SVD يعطينا rank factorization خاصة جدًا، لكنها لا تكتفي بأي أساس؛ تختار اتجاهات orthonormal وترتبها حسب القوة.

---

# حين نقبل أن نفقد قليلًا

لنفترض أن

\[
A=
\sigma_1u_1v_1^T+
\sigma_2u_2v_2^T+
\cdots.
\]

إذا كانت أول عدة قيم مفردة كبيرة والبقية صغيرة، قد نقرر الاحتفاظ بأول \(k\) طبقات فقط:

\[
\boxed{
A_k=
\sum_{i=1}^{k}\sigma_i u_i v_i^T
=U_k\Sigma_kV_k^T.
}
\]

نحن هنا لا نزعم أن \(A_k=A\). نحن نختار أن نخسر جزءًا من المعلومة مقابل تمثيل أبسط.

[[interactive:low-rank-reconstruction]]

### truncated SVD

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

القيمتان تتفقان حتى حدود الدقة العددية.



ما الذي خسرناه؟ الفرق هو \(A-A_k\).

ولقياس حجمه نستعمل Frobenius norm:

\[
\boxed{
\|M\|_F=
\sqrt{\sum_{i,j}m_{ij}^2}.
}
\]

وبسبب تعامد طبقات SVD نحصل على

\[
\boxed{
\|A-A_k\|_F^2
=
\sum_{i>k}\sigma_i^2.
}
\]

أي أن خطأ الحذف ليس لغزًا؛ إنه مجموع طاقات الطبقات التي قررنا تركها خلفنا.

---

# لماذا القطع الأولى هي الأفضل؟

هنا تأتي واحدة من أجمل نتائج القصة. truncated SVD ليس مجرد طريقة معقولة لاختيار rank-\(k\) approximation. إنه الأفضل في Frobenius norm.

إذا كان \(B\) أي مصفوفة تحقق \(\operatorname{rank}(B)\le k\)، فإن

\[
\boxed{
\|A-A_k\|_F
\le
\|A-B\|_F.
}
\]

أي أنه إذا أعطيتك ميزانية لا تسمح إلا بـ\(k\) اتجاهات مستقلة، فلن تجد rank-\(k\) matrix أقرب إلى \(A\) من truncated SVD.

الفكرة وراء البرهان هي أن row space لأي \(B\) رتبتها لا تتجاوز \(k\) لا يمكن أن تلتقط أكثر من \(k\) اتجاهات مستقلة. إذا أسقطنا \(A\) على أي فضاء بعده \(k\)، فإن أكبر طاقة يمكن الاحتفاظ بها تأتي من الاتجاهات المرتبطة بأكبر singular values. لذلك اختيار \(v_1,\ldots,v_k\) ليس ذوقًا؛ هو الاختيار الذي يحتفظ بأكبر مقدار ممكن من \(\sum\sigma_i^2\).

وبالتالي يكون الجزء المفقود أصغر ما يمكن:

\[
\sum_{i>k}\sigma_i^2.
\]

هذه هي روح Eckart–Young: **إذا كان عليك أن تنسى، فانْسَ أضعف الاتجاهات أولًا.**

---

# أين نتوقف؟

النظر إلى singular-value spectrum يشبه النظر إلى طبقات الجبل من جانبه. إذا هبطت القيم بسرعة ثم ظهر ذيل طويل صغير، فهذا يخبرنا أن كثيرًا من البنية يمكن وصفه بعدد قليل من الاتجاهات.

[[interactive:singular-spectrum]]

### singular values وخطأ التقريب

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

خطأ Frobenius الأمثل عند rank-\(k\):

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

مقياس شائع هو الطاقة المحتفظ بها:

\[
E_k=
\frac{\sum_{i=1}^{k}\sigma_i^2}
     {\sum_i\sigma_i^2}.
\]

لا يوجد \(k\) سحري يصلح لكل مشكلة. اختيار \(k\) هو مقايضة بين البساطة والدقة، وفي التطبيقات الحقيقية قد تدخل أيضًا قيود الذاكرة والزمن وأداء المهمة نفسها.

---

# وهنا تدخل PCA

لنفترض أن \(X\) data matrix مركز حول المتوسط، وفيه \(n\) observations على الصفوف و\(p\) features على الأعمدة.

نفككه:

\[
X=U\Sigma V^T.
\]

مصفوفة covariance هي

\[
S=\frac{1}{n-1}X^TX.
\]

باستخدام SVD:

\[
X^TX
=V\Sigma^TU^TU\Sigma V^T
=V\Sigma^T\Sigma V^T.
\]

إذن

\[
\boxed{
S=
V\frac{\Sigma^T\Sigma}{n-1}V^T.
}
\]

وهنا نرى الجسر بوضوح: أعمدة \(V\) هي principal directions، وeigenvalues للـcovariance تساوي

\[
\boxed{
\lambda_i=\frac{\sigma_i^2}{n-1}.
}
\]

إذن SVD لا يصبح PCA تلقائيًا لمجرد أننا نفكك أي مصفوفة. نحتاج أولًا إلى تفسير data matrix، وعادةً إلى mean centering، ثم نستخدم SVD كآلة حسابية ونظرية لاستخراج اتجاهات أكبر variance.

[[interactive:pca-projection]]

### PCA مباشرة من SVD

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

ولخفض البيانات إلى \(k\) components:

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

### دع PCA يتحرك

للبيانات ثنائية الأبعاد:

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

إذا أردنا reduction إلى \(k\) أبعاد، نحتفظ بأول \(k\) أعمدة من \(V\). وexplained variance ratio للمكوّن \(i\) يصبح

\[
\boxed{
\frac{\sigma_i^2}{\sum_j\sigma_j^2}.
}
\]

لاحظ المربع. PCA تحاسب variance، ولذلك تدخل \(\sigma_i^2\)، لا \(\sigma_i\) وحدها.

يمكن تلخيص العلاقة في جملة واحدة:

> **SVD هي آلة المصفوفات؛ PCA أحد أجمل الاستخدامات الإحصائية لهذه الآلة.**

---

# SVD في الصور: حين ترى الـlow rank بعينيك

حتى الآن تحدثنا عن approximation وكأننا نحرك رموزًا على الورق. الصورة تجعلنا نرى الخسارة بأعيننا.

[[interactive:image-svd-compression]]




الصورة الرمادية ذات \(m\) صفوف و\(n\) أعمدة يمكن تمثيلها كمصفوفة

\[
A\in\mathbb R^{m\times n},
\]

حيث تمثل كل قيمة شدة pixel. وبمجرد أن أصبحت الصورة مصفوفة، أصبحت كل قصة SVD صالحة لها:

\[
A=
\sum_{i=1}^{r}\sigma_i u_i v_i^T.
\]

كل \(\sigma_i u_iv_i^T\) صورة-sized pattern من rank-1. لا يجب أن تتوقع أن تكون الطبقة الأولى “العين” والثانية “الشجرة”. هذه ليست segmentation دلالية؛ إنها أنماط separable رياضية تتراكب لتعيد الصورة.

إذا احتفظنا بأول \(k\) طبقات فقط نحصل على

\[
A_k=U_k\Sigma_kV_k^T.
\]

عندما يكون \(k\) صغيرًا تظهر البنية العامة أولًا، ثم تعود التفاصيل مع زيادة \(k\). ونسبة الطاقة المحتفظ بها هي

\[
\boxed{
E_k=
\frac{\sum_{i=1}^{k}\sigma_i^2}
     {\sum_{i=1}^{r}\sigma_i^2}.
}
\]

من ناحية التخزين، الصورة الأصلية تحتوي \(mn\) رقمًا، بينما تمثيل rank-\(k\) يحتاج تقريبًا

\[
k(m+n+1)
\]

رقمًا إذا خزنا \(U_k\) و\(\Sigma_k\) و\(V_k^T\). هذا يشرح المبدأ الرياضي للضغط، لكنه لا يعني أن JPEG أو WebP يعملان حرفيًا بحفظ هذه العوامل؛ codecs الحقيقية تدخل فيها quantization وentropy coding وتفاصيل هندسية أخرى.

أما صورة RGB فيمكن في أبسط تجربة تعليمية أن نفكك قنوات \(R\) و\(G\) و\(B\) كل واحدة على حدة، ثم نعيد جمعها بعد truncation.

الفائدة من هذا المثال ليست فقط “ضغط صورة”. إنه يمنح Eckart–Young وجهًا نراه: نحذف اتجاهات رياضية، ثم ننظر مباشرة إلى ما اختفى من الصورة.


### ضغط الصور بـSVD

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

جرّب عدة قيم لـ\(k\)، ثم قارن جودة الصورة بصريًا مع Frobenius error.

# SVD داخل الشبكات العصبية

ضغط الشبكات العصبية موضوع أوسع بكثير، لكن هناك جسرًا واحدًا يستحق أن نفتحه لأن الرياضيات هي نفسها تمامًا.

[[interactive:neural-network-svd]]

طبقة fully connected تبدأ بتحويل خطي:

\[
y=Wx+b.
\]

تجاهل activation لحظة وانظر إلى \(W\). إنها مصفوفة. إذن

\[
W=U\Sigma V^T.
\]

إذا هبطت singular values بسرعة، يمكننا تقريبها بـ

\[
W\approx U_k\Sigma_kV_k^T.
\]

ضع ذلك داخل الطبقة:

\[
y\approx U_k\Sigma_kV_k^Tx+b.
\]

الآن بدل linear layer كبيرة واحدة يمكن أن نفكر في تحويلين خطيين أصغر:

\[
x
\xrightarrow{V_k^T}
z\in\mathbb R^k
\xrightarrow{U_k\Sigma_k}
y\in\mathbb R^m.
\]

إذا كانت \(W\in\mathbb R^{m\times n}\)، فالطبقة الأصلية تحمل \(mn\) weight parameters، بينما العاملان يحتاجان تقريبًا

\[
k(m+n).
\]

إذا كان \(k\ll m,n\)، فالفرق قد يكون كبيرًا.

لكن هناك تفصيلة لا يجوز القفز فوقها: إذا كان العاملان يستبدلان linear map واحدة، فلا نضع nonlinearity بينهما، وإلا لم نعد نمثل نفس rank-\(k\) matrix product.

وهنا يظهر اتصال جميل مع PCA. PCA تسأل: هل activations تحتاج فعلًا كل هذه الاتجاهات؟ أما SVD على weights فتسأل: هل weight matrix نفسها تحتاج كل هذه الاتجاهات؟

---

# استكشاف عددي

الصيغتان \(\sigma_i=\sqrt{\lambda_i(A^TA)}\) and \(u_i=\frac{Av_i}{\sigma_i}\) ممتازتان للفهم.

لكن في البرمجيات العددية قد يؤدي تكوين \(A^TA\) صراحةً إلى سوء أكبر في conditioning لأن condition number يُربّع عمليًا. لذلك تستخدم مكتبات SVD الموثوقة خوارزميات أكثر استقرارًا بدل تنفيذ الفكرة النظرية حرفيًا.

إذن افصل بين سؤالين. إذا كان السؤال: *من أين جاءت SVD؟* فـ\(A^TA\) باب جميل للفهم. أما إذا كان السؤال: *كيف أحسبها في عمل عددي حقيقي؟* فاستخدم routine موثوقة مثل `numpy.linalg.svd` أو `scipy.linalg.svd` أو MATLAB `svd`. الفهم والتنفيذ مرتبطان، لكنهما ليسا الشيء نفسه.



---

# إشارات صغيرة لا تغيّر القصة

حتى بعد أن نجد SVD، لا يعني ذلك أن كل حرف فيها فريد بالطريقة التي قد نتوقعها. فإذا غيّرنا إشارة \(u_i\) و\(v_i\) معًا، فإن \(\sigma_i(-u_i)(-v_i)^T=\sigma_i u_iv_i^T\).

إذن الإشارة يمكن أن تنقلب في الزوج معًا دون أن تتغير المصفوفة.

وإذا تكررت singular value، مثل \(\sigma_1=\sigma_2\)، فقد يكون subspace نفسه محددًا بينما لا يكون اختيار basis داخله فريدًا. المهم هنا أن SVD ترتب البنية، لكن بعض التفاصيل التمثيلية يمكن أن تتغير من خوارزمية إلى أخرى دون أن تتغير الحقيقة الرياضية.

---

# أربعة فضاءات في لقطة واحدة

إذا كانت رتبة \(A\) تساوي \(r\)، فإن أول \(r\) right singular vectors تمتد عليها row space:

\[
\mathcal R(A^T)=\operatorname{span}(v_1,\ldots,v_r).
\]

أما البقية فتملأ null space:

\[
\mathcal N(A)=\operatorname{span}(v_{r+1},\ldots,v_n).
\]

وعلى جهة الخرج، أول \(r\) left singular vectors تمتد عليها column space:

\[
\mathcal R(A)=\operatorname{span}(u_1,\ldots,u_r),
\]

والبقية تعطي left null space:

\[
\mathcal N(A^T)=\operatorname{span}(u_{r+1},\ldots,u_m).
\]

هنا نفهم لماذا يبدو SVD كأنه يجمع فصولًا كثيرة من الجبر الخطي في مشهد واحد: rank وrow space وcolumn space وnull spaces وorthogonality وeigenvectors وapproximation كلها تلتقي في نفس البناء.

---

# ماذا تحمل كل طبقة؟

القطعة \(\sigma_i u_i v_i^T\) يمكن قراءتها بثلاث لهجات مختلفة من نفس اللغة. كـtransformation تقول \(v_i\xrightarrow{A}\sigma_i u_i\).

كـrank-1 layer هي لبنة واحدة داخل المصفوفة. وكـdata component، فإن \(v_i\) اتجاه على جهة features، بينما \(u_i\sigma_i\) يحمل scores على جهة observations، و\(\sigma_i^2\) يتحول — بعد scaling الخاص بالـcovariance — إلى مقدار variance الذي تشرحه هذه الجهة في PCA.

ليست هذه ثلاث نظريات. إنها ثلاث زوايا لنفس الجبر.

---

# الخريطة كاملة

[[interactive:concept-map]]

يمكن ضغط الرحلة كلها في سلسلة واحدة:

\[
\boxed{
\text{Composition}
\rightarrow
\text{Decomposition}
\rightarrow
\text{Structured factors}
}
\]

ثم

\[
\boxed{
\text{Rank}
\rightarrow
\text{Rank-1 pieces}
\rightarrow
A=\sum_i\sigma_i u_iv_i^T
}
\]

ثم

\[
\boxed{
A=U\Sigma V^T
\rightarrow
Av_i=\sigma_i u_i
}
\]

ثم نحتفظ بالأقوى:

\[
\boxed{
A_k=U_k\Sigma_kV_k^T
}
\]

فتعطينا Eckart–Young أفضل rank-\(k\) approximation، ثم تظهر نفس right singular directions في PCA عندما يكون لدينا centered data.

إذا اختفت كل التفاصيل غدًا، احتفظ بهذه الفكرة:

> **SVD تبحث عن اتجاهات دخل متعامدة معيارية تتعامل معها المصفوفة بصورة مستقلة، وتخبرنا بقوة كل اتجاه، ثم ترتبها بحيث تصنع أقوى الاتجاهات أفضل وصف منخفض الرتبة للمصفوفة.**

---

# الجيران الذين مررنا بهم

**LU** يكتب \(A=LU\) ويحوّل Gaussian elimination إلى عامل سفلي وآخر علوي. **QR** يكتب \(A=QR\) ويفصل basis orthonormal عن معاملات مثلثية، ولذلك يظهر طبيعيًا في least squares. **Cholesky** يكتب \(A=LL^T\) عندما تكون المصفوفة symmetric positive definite، مستغلًا التماثل بدل حساب عاملين مستقلين.

**Spectral decomposition** يجعل المصفوفة symmetric في صورة \(A=Q\Lambda Q^T\)، حيث الأعمدة في \(Q\) eigenvectors orthonormal و\(\Lambda\) diagonal. **Jordan** يذهب أبعد نظريًا ليصل إلى صورة قطرية أو شبه قطرية عندما تسمح البنية، لكنه أكثر حساسية عدديًا. **Schur** يرضى بمصفوفة مثلثية \(T\) لكنه يكسب تحويلًا unitary مستقرًا، ولهذا هو أكثر راحة للحساب العددي.

**Polar decomposition** يكتب \(A=QH\)، فيفصل rotation/reflection عن pure stretching. وإذا كانت لدينا SVD

\[
A=U\Sigma V^T,
\]

فيمكن رؤية

\[
Q=UV^T,
\qquad
H=V\Sigma V^T.
\]

أما **Interpolative decomposition** فيكتب تقريبًا \(A\approx CX\) مع اختيار أعمدة فعلية من \(A\)، فيكسب interpretability على حساب أن اتجاهاته ليست بالضرورة الاتجاهات المثلى التي تنتجها SVD.

الفكرة التي تجمع الجميع لا تزال كما هي:

\[
\boxed{
\text{هل توجد طريقة ننظر بها إلى المصفوفة فتغدو أبسط؟}
}
\]
# من القمة

النظر من القمة نحو الأفق شيء جميل. من هناك يبدو SVD كأن كل شيء اجتمع في لقطة واحدة: اتجاهات نظيفة، وتمدد، وطبقات rank-1، وتقريب منخفض الرتبة، ثم PCA والصور وحتى لمحة من الشبكات العصبية.

لكن القمة تخفي الطريق الذي صنعها. بدأنا بقطع نعرفها فجمعناها، ثم قلبنا السؤال وبدأنا التفكيك. ومع كل طبقة انكشف جزء آخر من الجبل.

> **النظر من القمة نحو الأفق شيء جميل، لكن ما كنا نحتاجه فقط قفزة إيمان لنرى ممَّا تكوَّن هذا الجبل.**

# المراجع

Andrews, H. C., & Patterson, C. L. (1976). Singular value decomposition (SVD) image coding. *IEEE Transactions on Communications, 24*(4), 425–432. [https://doi.org/10.1109/TCOM.1976.1093309](https://doi.org/10.1109/TCOM.1976.1093309)

Brain Station Advanced. (n.d.). *No one taught SVD (singular value decomposition) like this* [Video]. YouTube. [https://youtu.be/llisH02KLrE](https://youtu.be/llisH02KLrE)

Denton, E. L., Zaremba, W., Bruna, J., LeCun, Y., & Fergus, R. (2014). Exploiting linear structure within convolutional networks for efficient evaluation. In *Advances in neural information processing systems* (Vol. 27, pp. 1269–1277). [https://proceedings.neurips.cc/paper/2014/hash/1adaeb993eba95859121a43ea61bd858-Abstract.html](https://proceedings.neurips.cc/paper/2014/hash/1adaeb993eba95859121a43ea61bd858-Abstract.html)

*Existence of the singular value decomposition (SVD): A very detailed step-by-step explanation.* (n.d.). [Unpublished study notes].

Jaderberg, M., Vedaldi, A., & Zisserman, A. (2014). Speeding up convolutional neural networks with low rank expansions. In *Proceedings of the British Machine Vision Conference 2014*. [https://doi.org/10.5244/C.28.88](https://doi.org/10.5244/C.28.88)

*Matrix decompositions: Cohesive summary.* (n.d.). [Unpublished study notes].

MIT OpenCourseWare. (n.d.-a). *Singular value decomposition* [Video]. YouTube. [https://youtu.be/TX_vooSnhm8](https://youtu.be/TX_vooSnhm8)

MIT OpenCourseWare. (n.d.-b). *Singular value decomposition (the SVD)* [Video]. YouTube. [https://youtu.be/mBcLRGuAFUk](https://youtu.be/mBcLRGuAFUk)

Sainath, T. N., Kingsbury, B., Sindhwani, V., Arisoy, E., & Ramabhadran, B. (2013). Low-rank matrix factorization for deep neural network training with high-dimensional output targets. In *2013 IEEE International Conference on Acoustics, Speech and Signal Processing* (pp. 6655–6659). [https://doi.org/10.1109/ICASSP.2013.6638949](https://doi.org/10.1109/ICASSP.2013.6638949)

*SVD, matrix rank, low-rank approximation, PCA, and the existence proof: A detailed, intuitive, step-by-step study guide.* (n.d.). [Unpublished study notes].

Visual Kernel. (n.d.). *SVD visualized, singular value decomposition explained | SEE Matrix, chapter 3* [Video]. YouTube. [https://youtu.be/vSczTbgc8Rc](https://youtu.be/vSczTbgc8Rc)
