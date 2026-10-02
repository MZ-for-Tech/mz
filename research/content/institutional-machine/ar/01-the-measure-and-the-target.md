**القياس والهدف**

في عام 1975، كتب الاقتصادي البريطاني تشارلز جودهارت ما ينبغي أن يكون الاقتباس الأهم في مجال سلامة الذكاء الاصطناعي:

> «أي انتظام إحصائي ملحوظ يميل إلى الانهيار عندما يُفرض عليه ضغطٌ لأغراض التحكم.» (Goodhart, 1975)
>
> أو على حد تعبير عالمة الأنثروبولوجيا مارلين ستراثيرن: «عندما يصبح المقياس هدفًا، يفقد صلاحيته كمقياس جيد.» (Strathern, 1997)

**1. من التوافق داخل العينة إلى التنبؤ المتوقع**

لقد رفض الإحصائيون التقليديون دائمًا فكرة "مقياس واحد يناسب الجميع". خذ $R^2$ في نمذجة الانحدار على سبيل المثال. تم تقديمه لأنه كانت هناك حاجة إلى رقم محدد يوضح مقدار التباين في المتغير المستهدف الذي تم تفسيره بواسطة النموذج.

ثم جاء إدراك أنه من السهل نفخه، حيث أن إضافة المتنبئين لا يمكن إلا أن يحافظ على $R^2$ أو يزيده في العينة، حتى عندما لا يساهم هؤلاء المتنبئون بقيمة تفسيرية حقيقية تذكر.

<!-- visual:r2-inflation -->

وهكذا قرروا الحصول على أقسى سلاح إحصائي: درجات الحرية. إذا قدم المرء ميزة غير ذات صلة، فإن DOF يجعل من الصعب مكافأة التعقيد غير الضروري. لقد أصبح مقياسًا أكثر تحفظًا للملاءمة، لكنه لا يزال يفتقر إلى إمكانية التعميم خارج مجموعة البيانات.

لقد تناولت AIC وBIC و$R^2$ التي تم التحقق من صحتها المشكلة الأوسع من اتجاهات مختلفة، حيث حاول كل منها التمييز بين أداء النموذج ذي المعنى والملاءمة الموجودة فقط في البيانات المتوفرة (Akaike, 1974; Schwarz, 1978).

عندما ظهر التعلم الآلي، حول الكثير من التركيز من تقدير العلاقات وتفسيرها إلى تحسين الأداء التنبؤي خارج العينة.

خذ بعين الاعتبار شركة تحاول فهم ما يحفز المبيعات: تساعد القيم الاحتمالية وفترات الثقة في الإجابة على هذا السؤال الاستدلالي. ولكن إذا أرادت الشركة معرفة أين ستكون المبيعات بحلول الربع الرابع، فقد يكون النموذج التنبؤي أكثر فائدة. طُلب من أحد علماء البيانات أن يصمم نموذجًا لتلك المبيعات، وقد يناسب نموذج الانحدار الخطي إذا كان مناسبًا. إذا كانت المهمة تقتصر فقط على التنبؤ بالمبيعات من متغيرات محددة، تصبح مشكلة $R^2$ أقل أهمية في حد ذاتها.

قاموا بتقسيم البيانات إلى التدريب والاختبار والتحقق من الصحة. وعلى نطاق صغير، يساعدنا هذا الانفصال على حمايتنا من خداع أنفسنا.

**2. طبقتان وكيلتان في RLHF**

ولكن ماذا يحدث عندما نوسّع هذه المشكلة؟ غيّرت ورقة *Attention Is All You Need* بنية المجال في عام 2017 (Vaswani et al., 2017)، وهو عام محوري للذكاء الاصطناعي. وطرحت DeepMind التابعة لشركة Google ومختبر الأبحاث الصغير غير الربحي OpenAI سؤالًا: كيف يمكننا إيصال الأهداف إلى نظام ذكاء اصطناعي، بينما يصعب علينا كتابة دالة المكافأة الصحيحة بأنفسنا؟ وكانت ثمرة هذا التعاون ورقة بعنوان *Deep Reinforcement Learning from Human Preferences*، التي أصبحت خطوة أساسية نحو تقنية «التعلم المعزز من ردود الفعل البشرية» (Christiano et al., 2017).

بحلول عام 2022، كان ChatGPT قد جلب نماذج لغوية كبيرة إلى الجماهير، وأصبح قانون جودهارت أكثر أهمية (OpenAI, 2022).

يمكنك إنشاء درجات التفضيل البشري لأن الخسارة لا تعكس الفائدة. ثم يتم تحسين النماذج مقابل درجات التفضيل تلك.

يمكنك إنشاء نماذج المكافأة لأن البشر لا يستطيعون تقييم ملايين العينات. ثم تكتشف السياسات نقاط الضعف في نموذج المكافأة (Christiano et al., 2017; Efimov, 2025; Ouyang et al., 2022).

<!-- visual:double-goodhart -->

إن RLHF بسيط من الناحية النظرية، لكنه يتحدى قانون جودهارت مرتين، وليس مرة واحدة. للبدء، يتم تدريب نموذج مكافأة مخصص لتوقع ما يفضله المقيِّمون البشريون. وبعد ذلك، يتم تحسين نموذج اللغة مباشرة مقابل هذا الوكيل.

وبالتالي، ينتهي الأمر بالمرء إلى تحسين تمثيل *للتفضيل البشري* بدلاً من نية المستخدم الحقيقية (Ouyang et al., 2022). وفي الفجوة بين الوكيل والهدف الأساسي، يصبح اختراق المكافأة ممكنًا؛ يمكن أن تظهر تشوهات أكثر دقة، بما في ذلك التملق والسلوكيات الأخرى التي ترضي المُقيّم، عندما تتم مكافأتهم بشكل أكثر موثوقية من الشيء الذي كنا نعتزم قياسه بالفعل (Gao et al., 2023; Sharma et al., 2024).

ومع ذلك، على نطاق البحث، حتى المعيار يمكن أن يصبح هدفًا في النهاية.

**3. عندما تصبح المعايير أهدافًا**

يمكنك إنشاء مجموعة اختبار معلقة لأن أداء التدريب قابل للعب.

ولكن بمجرد إعادة استخدام نفس المعيار عبر الأبحاث والهندسة المعمارية والقرارات البحثية لسنوات، يبدأ الباحثون في تحسينه بشكل غير مباشر أيضًا. في نهاية المطاف، يصبح المعيار نفسه بشكل غير مباشر جزءًا من عملية التطوير.

في عصر نماذج اللغات الكبيرة (LLMs)، اكتسبت هذه المشكلة اسمًا غير جدي للغاية لمشكلة خطيرة: Benchmaxxing. أيًا كان المعيار الذي يصبح النجم الرائد، فإنه يصبح أيضًا هدفًا للتحسين - تمامًا مثل $R^2$ قبله.

وقد تكون النتيجة نموذجًا يبدو أكثر كفاءة مما هو عليه في الواقع. MMLU، أو HumanEval، أو GSM8K، أو SWE-bench، أو أي معيار يهيمن على لوحة المتصدرين الحالية يصبح ذا أهمية تجارية.

<!-- visual:benchmaxxing -->

يتم تنظيم البيانات حول مهام تشبه المعايير، ويتم اتخاذ قرارات ما بعد التدريب من خلال حركة لوحة الصدارة، وفي النهاية يصبح التمييز بين "لقد بنينا نموذجًا أفضل" و"بنينا نموذجًا أفضل في الاختبارات التي يشاهدها الجميع" أمرًا صعبًا بشكل متزايد لإنشاء (Akhtar et al., 2026; Chen et al., 2026).

المشكلة الأعمق ليست أن المعايير يتم التلاعب بها. إنه بمجرد حدوث ذلك، فإننا نفقد القدرة على تقييم التقييم نفسه. الطالب الذي يغش في الامتحان يحصل على درجة عالية. لم يعد الامتحان قادرًا على إخبارنا بما كان من المفترض أن يفعله.

**4. مشكلة قديمة على نطاق جديد**

<!-- paragraph:thesis --> وبالتالي فإن المشكلة ليست مشكلة فريدة في مجال التعلم الآلي بقدر ما هي مشكلة قديمة في ظل مُحسِّن جديد: قانون Goodhart المطبق على النطاق الحسابي (Manheim & Garrabrant, 2018).

وهذا يثير سؤالاً: ماذا لو كانت العديد من المشاكل التي نطلق عليها الآن "محاذاة الذكاء الاصطناعي" هي مشاكل قديمة تتعلق بالقياس والحوافز والمعلومات والتحكم - فقط مع وجود مُحسِّن أقوى بكثير على الجانب الآخر؟

**المراجع**

Akaike, H. (1974). [*A new look at the statistical model identification*](https://doi.org/10.1109/TAC.1974.1100705). *IEEE Transactions on Automatic Control, 19*(6), 716–723.

Akhtar, M., Reuel, A., Soni, P., Ahuja, S., Ammanamanchi, P. S., Rawal, R., Zouhar, V., Yadav, S., Whitehouse, C., Ki, D., Mickel, J., Choshen, L., Šuppa, M., Batzner, J., Chim, J., Sania, J., Long, Y., Rahmani, H. A., Knight, C., . . . Solaiman, I. (2026). [*When AI benchmarks plateau: A systematic study of benchmark saturation*](https://doi.org/10.48550/arXiv.2602.16763) [Preprint]. arXiv.

Chen, Y., Zhang, G., & Hardt, M. (2026). [*Leaderboard incentives: Model rankings under strategic post-training*](https://doi.org/10.48550/arXiv.2603.08371) [Preprint]. arXiv.

Christiano, P. F., Leike, J., Brown, T. B., Martic, M., Legg, S., & Amodei, D. (2017). [*Deep reinforcement learning from human preferences*](https://doi.org/10.48550/arXiv.1706.03741) [Preprint]. arXiv.

Efimov, V. (2025, June 21). [*Explained simply: Reinforcement learning from human feedback*](https://towardsdatascience.com/explained-simply-reinforcement-learning-from-human-feedback/). Towards Data Science.

Gao, L., Schulman, J., & Hilton, J. (2023). [Scaling laws for reward model overoptimization](https://proceedings.mlr.press/v202/gao23h.html). In A. Krause, E. Brunskill, K. Cho, B. Engelhardt, S. Sabato, & J. Scarlett (Eds.), *Proceedings of the 40th International Conference on Machine Learning* (Vol. 202, pp. 10835–10866). Proceedings of Machine Learning Research.

Goodhart, C. A. E. (1975). Problems of monetary management: The U.K. experience. In *Papers in monetary economics* (Vol. 1, pp. 1–20). Reserve Bank of Australia.

Manheim, D., & Garrabrant, S. (2018). [*Categorizing variants of Goodhart’s law*](https://doi.org/10.48550/arXiv.1803.04585) [Preprint]. arXiv.

OpenAI. (2022, November 30). [*Introducing ChatGPT*](https://openai.com/index/chatgpt/).

Ouyang, L., Wu, J., Jiang, X., Almeida, D., Wainwright, C. L., Mishkin, P., Zhang, C., Agarwal, S., Slama, K., Ray, A., Schulman, J., Hilton, J., Kelton, F., Miller, L., Simens, M., Askell, A., Welinder, P., Christiano, P. F., Leike, J., & Lowe, R. (2022). [Training language models to follow instructions with human feedback](https://doi.org/10.52202/068431-2011). *Advances in Neural Information Processing Systems, 35*, 27730–27744.

Schwarz, G. (1978). [Estimating the dimension of a model](https://doi.org/10.1214/aos/1176344136). *The Annals of Statistics, 6*(2), 461–464.

Sharma, M., Tong, M., Korbak, T., Duvenaud, D., Askell, A., Bowman, S. R., Durmus, E., Hatfield-Dodds, Z., Johnston, S. R., Kravec, S. M., Maxwell, T., McCandlish, S., Ndousse, K., Rausch, O., Schiefer, N., Yan, D., Zhang, M., & Perez, E. (2024). [Towards understanding sycophancy in language models](https://proceedings.iclr.cc/paper_files/paper/2024/hash/0105f7972202c1d4fb817da9f21a9663-Abstract-Conference.html). *International Conference on Learning Representations*.

Strathern, M. (1997). ‘Improving ratings’: Audit in the British University system. *European Review, 5*(3), 305–321. [https://doi.org/10.1002/%28SICI%291234-981X%28199707%295:3%3C305::AID-EURO184%3E3.0.CO;2-4](https://doi.org/10.1002/%28SICI%291234-981X%28199707%295:3%3C305::AID-EURO184%3E3.0.CO;2-4)

Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). [*Attention is all you need*](https://arxiv.org/abs/1706.03762). *Advances in Neural Information Processing Systems, 30*, 5998–6008.
