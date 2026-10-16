# قراءة معمقة في L1 — الحزمة العربية والإنجليزية

افتح `L1_Deep_Reading_Arabic_Reviewed.md` أو `L1_Deep_Reading_English_Reviewed.md` للقراءة. النص فقرات متتابعة، ولكل فقرة عنوان قصير يناسب أسلوبها، بلا تقسيم إلى فصول أو أجزاء، والمعادلات بلا صناديق. اتخذ افتتاحية «قراءة معمقة L1» وطريقة الانتقال بالمثال والسؤال مرجعا للصياغة، وصحح مثال `2(3, −2)=(6, −4)` والمعادلات التي تلفت في PDF. النسخة الإنجليزية تقابل العربية فقرة بفقرة، والأكواد فيهما متطابقة.

المحتوى يغطي أول **40 صفحة فعلية من PDF**؛ آخرها الصفحة المطبوعة 39 عن حدود L1. لم يضف الفصل 21 الموجود في الصفحة الفعلية 41. اختُصر الشرح المتكرر، مع إبقاء المفاهيم الأساسية ومعادلاتها وشروطها. تأتي أمثلة Python بعد الفقرات التي يساعد حسابها على فهم الفكرة؛ لا تحتاج المقدمة والفقرة التاريخية إلى كود. حُذف مثال طباعة التواريخ، واختُصرت تفاصيل المحلّل، ووضّحت المقارنات ذات القيمة التعليمية.

افتح **`L1_Reading_Preview.html`** لقراءة المقالة كاملة بعناوين ظاهرة فوق الفقرات؛ اضغط المعادلة نفسها لفتح تفصيل خاص بها، واضغطها ثانية لطيه. يشرح التفصيل الرموز وخطوات الوصول للنتيجة والمثال والشروط. يبقى الشرح المختصر ضمن الفقرة الأصلية؛ يمكن التبديل بين العربية والإنجليزية دون اتصال. تضم كل نسخة 36 عنوان فقرة وعنوان المصادر، مع 39 مثالا قابلا للتشغيل. أضيفت خمس تجارب قصيرة عن λmax والقيم الشاذة واندماج TV وتقاسم Elastic Net للمتغيرات المتطابقة وأثر وحدات المتغيرات.

افتح **`L1_Interactive_Figures.html`** مباشرة في متصفح حديث. يعمل دون اتصال ودون تثبيت، ويحتوي الرسومات الثلاث عشرة من نطاق القراءة، ورسمتين مساعدتين من البحث عن الغلاف المحدب وفجوة الأمثلية. خط التاريخ يضم عشر محطات من 1970 إلى 2015: اضغط السنة لتقرأ أصحاب العمل وسؤاله وفكرته وحدوده، وتفتح الورقة الأصلية أو المثال المرتبط. أضيف عرض الهدف الكامل للعتبة وزر λmax في الانحدار وإرشادات «جرّب ثم لاحظ» في خمس رسومات. اختر الرسم واللغة، ثم حرك عناصر التحكم؛ الحسابات والرسمة يتغيران معا. الروابط داخل Markdown تفتح الرسم المناسب. يجب إبقاء ملفات الحزمة معا بعد فك الضغط كي تعمل الروابط النسبية.

كل رسم له **JSON منفصل ثنائي اللغة** في `interactive/public/figures/`. هذه ملفات إعداد وبيانات وفق مخطط الحزمة، وليست ملفات تنفيذ مستقلة أو مخطط استيراد رسميا خاصا بمنصة MZ. مشغّل React المرفق يقرأ الإعدادات ويستخدم **Framer Motion فعليا** في `interactive/src/main.jsx`، بما في ذلك حركة منحنيات SVG والأعمدة والنقاط، ويحترم تفضيل تقليل الحركة. نسخة HTML تضم مشغلها وبياناتها؛ إذا عدلت JSON، حدّث النسخة المجمعة ثم أعد البناء كما هو موضح أدناه.

الألوان مأخوذة من CSS الفعلي لصفحة [MZ Research](https://www.mzfortech.com/research)، كما فُحص في 10 أكتوبر 2026: `.tnh-site` يستخدم ورقا `#f5f2ed` وحبرا `#111111` ولمسة `#8b3a2b` وقلم رصاص `#756b5e`؛ وتضم الحزمة نسق الصفحة الداكن كذلك. اللونان الزيتوني والذهبي من متغيرات الموقع العامة. التفاصيل في `interactive/public/theme.json`.

لتشغيل جميع أمثلة القراءة بالترتيب:

```bash
python -m pip install -r code/requirements.txt
python code/experiments.py
```

يمكنك أيضا نسخ صناديق Python إلى دفتر وتشغيلها بالترتيب. المثال الأول يستورد NumPy، وتظهر `soft` عند شرح العتبة اللينة؛ تسبق البيانات والدوال الأمثلة التي تحتاج إليها. تفاصيل محلّل الإحداثيات ودالة الفجوة موجودة اختياريًا في `code/advanced_methods.py`. `code/experiments.py` يجمع الأكواد نفسها. تعتمد أمثلة البيانات وحل Lasso والفجوة والاستبعاد الآمن والتحقق المتقاطع وإعادة أخذ العينات وBasis Pursuit وSVD على أكواد `L1_Deep_Research_and_Explanation(2).pdf`؛ اختصرت أكواد الرسم الثابت لصالح الرسومات التفاعلية، وأضيفت أمثلة صغيرة للموضوعات التي لم يوفر لها البحث كودا مباشرا. يبين `provenance.json` مصدر كل مثال وما أعيدت صياغته.

لتعديل مشغل الرسومات أو دمجه في مشروع React، من داخل `interactive`:

```bash
npm ci
npm run dev
```

لإعادة بناء نسخة HTML دون اتصال:

```bash
npm run build
```

في النسخة الحالية يضم `src/figures.generated.json` إعدادات الرسومات نفسها في ملف مجمع للاستخدام دون طلبات شبكة. بعد تعديل ملف منفرد، أعد جمع الملفات مرتبة حسب `public/manifest.json`:

```bash
node sync-figures.mjs
npm run build
```

تثبت `package-lock.json` إصدارات الاعتماديات المستخدمة. توثيق الحركة: [Motion React animation](https://motion.dev/docs/react-animation). بيانات الرسم السادس والعينة المرجعية اصطناعية من البذور الأصلية؛ التواترات في الرسم الثامن نتائج إعادة الملاءمة الفعلية عند λ=0.07 ببذرة 2026، ويمكن عرض أول 10 إلى 250 عينة. رسم TV يحسب الحل التحليلي للصف التعليمي المحدد، ولا يطبق عتبة مستقلة على فروق صورة عامة. رسم التخزين يحسب البايتات الخام ولا يقدم قياس سرعة.

---

Open either Markdown file to read the continuous essay, with a short heading for each paragraph. The two versions correspond paragraph by paragraph and contain the same 39 sequential Python examples, including five new teaching experiments. Coverage ends at physical PDF page 40 (printed page 39); Chapter 21 is outside this scope.

Open `L1_Reading_Preview.html` for the full essay with visible paragraph headings and offline typeset equations. Switch between Arabic and English at the top.

Open `L1_Interactive_Figures.html` directly for all 13 source figures and 2 research companion figures, with Arabic/English labels, live calculations, light/dark themes, and reduced-motion support. The HTML works offline. Keep the extracted folder intact for Markdown links to work.

Each separate JSON file is a bilingual declarative configuration for the supplied React/Framer Motion renderer. It is not executable by itself and is not represented as an official MZ import format. Source code, schema, manifest, theme provenance, Python examples, and dependency lockfile are included. Use `npm ci`, `npm run dev`, or `npm run build` inside `interactive` when editing; run `node sync-figures.mjs` after changing individual figure JSON files.

The supplied PDFs are the sources for the rewritten explanations and adapted code. The package adds small numerical examples where required, preserves the research data seeds, and verifies the central numerical results. The offline viewer contains bundled third-party open-source runtime code; dependency licenses are included in `interactive/THIRD_PARTY_LICENSES.txt`.

The expanded timeline has 10 clickable landmarks (1970–2015), with authors, motivating questions, contributions, assumptions, links to original papers, and related examples. The threshold figure now includes an objective view; regression exposes λmax and a button to reach the all-zero-slope solution. Five figures include short guided experiments.

داخل ملفَي Markdown يأتي بعد كل مجموعة معادلات عنصر `<details>` قابل للطي في القرّاء الذين يدعمون HTML. المعادلة نفسها تبقى عرضا رياضيا مستقلا؛ النقر عليها مباشرة لفتح الشرح متاح في معاينة HTML. جميع الشروحات مغلقة افتراضيا، دون تحميل خارجي أو صناديق حول المعادلات.

The HTML preview makes each of the 26 displayed equation groups per language a native disclosure target: click the equation to open its tailored explanation and click again to fold it. The existing main-text explanation, headings, equations, and 39 Python blocks are preserved exactly. Markdown adds a native `<details>` disclosure below each equation; visibility depends on the reader’s HTML support.
