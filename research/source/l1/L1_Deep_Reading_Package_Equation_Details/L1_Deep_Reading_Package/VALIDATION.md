# التحقق / Validation

تاريخ المراجعة: 10 أكتوبر 2026.

- نُفذت أمثلة Python التسعة والثلاثون بالتتابع، وتحققت مطابقتها بين النسختين.
- معامل Lasso عند λ=0.07: `(1.82110836, 0, 0)`؛ خطأ العينة المرجعية `0.38685722`.
- تحقق وجود 36 عنوانًا فوق فقرات النص وعنوان المصادر في كل Markdown؛ عُرضت العناوين نفسها في معاينة HTML، مع 52 معادلة عبر اللغتين.
- حُذف كود طباعة التواريخ، ونُقلت تفاصيل محلّل Lasso إلى ملف اختياري، واختُصرت الفجوة، ووضّح مثال فشل الاستعادة ومثال العقوبة الاحتمالية.
- معاملات OLS: `(2.05628998, −0.16722535, −0.03861425)`؛ خطأ مرجعي `0.38617911`.
- معاملات Ridge عند λ=0.10: `(1.06261355, 0.73562651, −0.03253039)`؛ خطأ مرجعي `0.40505672`.
- أكبر مخالفة KKT في المثال نحو `1.4×10⁻¹⁷`، والفجوة الأصلية–الثنائية صفر ضمن دقة الأعداد العائمة.
- التحقق المتقاطع اختار λ=`0.02972504`، وخطأ مرجعي `0.38165656`.
- تواترات الاختيار عبر 250 نصف عينة، ببذرة 2026: `(1.000, 0.204, 0.188)`.
- تماس L1: `(1.2, 0)`؛ تماس L2: `(1.17918357, 0.22254460)`.
- Basis Pursuit أعاد `(1, 0, 0)` في المثال الجيد و`(0, 0.5)` في مثال الفشل.
- عتبة القيم المفردة عند τ=0.7 غيرت الرتبة من 2 إلى 1.
- أعاد حل JavaScript أرقام الانحدار والتماس نفسها، وفُحصت نهايات نطاق الميزانية.
- ملفات JSON الخمسة عشر اجتازت مخطط JSON Schema وفحص القيم الافتراضية.
- جرى توليد مكونات React/SVG في 92 حالة تحكم عبر اللغتين، دون قيم غير منتهية، ورُوجعت الرسومات المرسومة بصريا. أصلحت القيم المتزاحمة وعناوين الأعمدة.
- نجح بناء React/Framer Motion وإنتاج HTML يجمع الشفرة والبيانات دون اعتماد على شبكة أثناء العرض.

لم يتوفر متصفح محلي لإجراء اختبار تفاعل مباشر أو قياس التخطيط على الهاتف. فحص React/SVG والحسابات والبناء لا يعوض هذا الاختبار؛ لم تُسجّل له نتيجة نجاح. ملف `L1_Interactive_Figures.html` جاهز للفتح في متصفح حديث، والمصدر الكامل مرفق للفحص والتعديل.

All 39 sequential Python examples ran successfully; central numerical results were reproduced in JavaScript. The 15 JSON configurations passed schema validation, and 92 bilingual control states rendered through React/SVG without nonfinite values. Rasterized plots were visually checked. The offline React/Framer Motion build succeeded. A local browser was unavailable, so direct browser interaction and mobile layout testing were not completed or claimed.

The reviewed essay preview rendered all 74 headings and 52 equations successfully through Markdown and KaTeX. Each prose paragraph is directly preceded by a heading, and the 39 code blocks are identical across languages.

مراجعة الإضافات: 10 أكتوبر 2026.

- نُفذت التجارب الخمس الجديدة: عند λ/λmax≥1 تصبح معاملات الميل صفرا؛ يبقى الوسيط 12 مع تكبير القيمة الشاذة؛ يندمج البكسلان عند λ=1.5؛ يعطي Elastic Net معاملين متساويين نحو 0.9608 للعمودين المتطابقين؛ يكشف مثال تغيير الوحدات أثر المقياس ويزيله التوحيد في هذا التصميم المتعامد.
- جرى فحص المحطات العشر في العربية والإنجليزية، مع أسماء أصحاب الأعمال وروابط الأوراق وتنقل إلى أمثلة مرتبطة.
- اجتازت الأزرار والتنقل السابق وتبديل اللغة وعرض الهدف الكامل وزر λmax اختبار DOM محاكى. لم تختبر حركة الانتقال في متصفح فعلي؛ أعيد تركيب العرض المختار في بيئة المحاكاة لأن تلك البيئة لا تشغل حركة الخروج.
- نجح توليد 92 حالة تحكم للرسومات الخمس عشرة، وأُضيف فحص لكل المحطات وعرض الهدف عند نهايات a وλ، دون قيم غير منتهية.
- نجح بناء نسخة HTML دون اتصال بعد الإضافات. لم يتغير نطاق فقرات المقالة وعدد عناوينها.

The new controls passed simulated-DOM interaction checks; these do not replace a real-browser animation or mobile-layout check. Timeline publication years are accompanied by preprint-year qualifications where relevant. References link to original papers.

مراجعة شرح المعادلات عند الضغط: 10 أكتوبر 2026.

- لكل لغة 26 مجموعة معادلات لها شرح خاص، من ثلاثة عناوين وفقرات تفسيرية؛ 52 هدف ضغط و156 فقرة تفصيل عبر اللغتين.
- تحقق أن حذف عناصر التفاصيل من Markdown يعيد النص السابق حرفيا: لم يتغير الشرح الأصلي ولا عناوينه ولا معادلاته ولا أكواده.
- نجح عرض المعادلات الـ52 عبر KaTeX، مع 37 عنوانا رئيسيا في كل لغة.
- تحقق اختبار DOM محاكى أن جميع التفاصيل مغلقة في البداية، وأن الضغط على المعادلة يفتح شرحها وأن الضغط ثانية يطويه، وأن التبديل بين اللغتين يعمل. كل عنوان ضغط مرتبط بتلميح وصفي، ويستعمل عنصري summary وdetails الأصليين.
- لا يشمل الفحص اختبار تخطيط فعلي على الهاتف أو قارئا بعينه لـMarkdown؛ دعم الطي في Markdown يعتمد على سماح القارئ بعناصر HTML.

The 52 native equation disclosures passed simulated-DOM open/close and language-switch checks. Removing the Markdown disclosures reproduces the previous main essay byte-for-byte. Existing numerical code was unchanged, so its previous successful run remains applicable.
