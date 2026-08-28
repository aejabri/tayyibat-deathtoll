/* استبيان مطابقة نص نظام الطيبات — ليس تشخيصاً طبياً */
const SURVEY = [
  {
    id: "status",
    q: "علاقتك بنظام الطيبات؟",
    multi: false,
    opts: [
      { id: "follow", t: "أطبّقه الآن" },
      { id: "tried", t: "جرّبته ثم توقفت" },
      { id: "know", t: "أعرفه ولا أطبّقه" },
      { id: "new", t: "أول مرة أسمع به" }
    ]
  },
  {
    id: "why",
    q: "إن كنت تتبعه أو جرّبته: ما السبب الأهم؟",
    multi: true,
    opts: [
      { id: "quran", t: "الاسم والأثر القرآني (الطيبات)" },
      { id: "cheap", t: "أرخص وأبسط من عيادة أو حمية مدفوعة" },
      { id: "weight", t: "نزول وزن أو تحسّن لاحظته بنفسك" },
      { id: "diabetes", t: "السكري أو الضغط أو اضطرابات الهضم" },
      { id: "trust", t: "ثقة بالدكتور ضياء أو بمحتواه" },
      { id: "peer", t: "توصية قريب أو مؤثر" },
      { id: "na", t: "لا ينطبق — لم أطبّقه" }
    ]
  },
  {
    id: "meals",
    q: "حسب ما فهمت من النظام: كم وجبة رئيسية في اليوم؟",
    multi: false,
    scoreKey: "meals",
    opts: [
      { id: "2", t: "وجبتان فقط", score: 1 },
      { id: "3", t: "ثلاث وجبات", score: 0 },
      { id: "many", t: "كلما جعت", score: 0 },
      { id: "dk", t: "لا أعرف", score: 0 }
    ]
  },
  {
    id: "gap",
    q: "قاعدة الساعتين تعني:",
    multi: false,
    scoreKey: "gap",
    opts: [
      { id: "2h", t: "فاصل ساعتين على الأقل بعد الوجبة قبل أي أكل أو شراب فيه سعرات", score: 1 },
      { id: "fast", t: "صيام 16 ساعة يومياً", score: 0 },
      { id: "none", t: "لا توجد قاعدة زمنية", score: 0 },
      { id: "dk", t: "لا أعرف", score: 0 }
    ]
  },
  {
    id: "allowed",
    q: "أيّ مما يلي يُعدّ عادة ضمن المسموح في النسخ الشائعة؟",
    multi: true,
    scoreKey: "allowed",
    opts: [
      { id: "rice", t: "أرز بسمتي أو أرز أبيض", score: 1 },
      { id: "potato", t: "بطاطس", score: 1 },
      { id: "dates", t: "تمر", score: 1 },
      { id: "ghee", t: "سمن بلدي أو زبدة طبيعية", score: 1 },
      { id: "chicken", t: "دجاج مزارع", score: -1 },
      { id: "egg", t: "بيض", score: -1 }
    ]
  },
  {
    id: "banned",
    q: "أيّ مما يلي يُستبعد عادة في النظام؟",
    multi: true,
    scoreKey: "banned",
    opts: [
      { id: "legume", t: "بقوليات (فول، عدس، حمص)", score: 1 },
      { id: "dairy", t: "حليب وزبادي طازج", score: 1 },
      { id: "flour", t: "خبز ودقيق أبيض ومعجنات", score: 1 },
      { id: "lamb", t: "لحم ضأن", score: -1 },
      { id: "olive", t: "زيت زيتون", score: -1 }
    ]
  },
  {
    id: "insulin",
    q: "لو عندك سكري وتعالج بالإنسولين، ماذا يقول المنطق الطبي الآمن؟",
    multi: false,
    scoreKey: "insulin",
    opts: [
      { id: "stop", t: "أوقف الإنسولين فوراً واتبع القائمة فقط", score: -2 },
      { id: "keep", t: "لا توقف الدواء من تلقاء نفسك؛ أي تغيير مع طبيبك", score: 2 },
      { id: "half", t: "خفّض الجرعة للنصف بلا مراجعة", score: -1 },
      { id: "dk", t: "لا أعرف", score: 0 }
    ]
  },
  {
    id: "health",
    q: "حالتك الصحية ذات الصلة (اختياري):",
    multi: true,
    opts: [
      { id: "dm1", t: "سكري نوع 1 أو معتمد على إنسولين" },
      { id: "dm2", t: "سكري نوع 2" },
      { id: "kidney", t: "كلى أو غسيل كلوي" },
      { id: "heart", t: "قلب أو ضغط" },
      { id: "none", t: "لا شيء مما سبق / أفضل عدم الإفصاح" }
    ]
  }
];

function scoreSurvey(answers) {
  let pts = 0, max = 0;
  SURVEY.forEach((q) => {
    if (!q.scoreKey) return;
    const picked = answers[q.id] || [];
    if (q.multi) {
      q.opts.forEach((o) => {
        if (typeof o.score !== "number") return;
        if (o.score > 0) max += o.score;
        if (picked.includes(o.id)) pts += o.score;
      });
    } else {
      const best = Math.max(...q.opts.map((o) => (typeof o.score === "number" ? o.score : 0)));
      if (best > 0) max += best;
      const o = q.opts.find((x) => picked.includes(x.id));
      if (o && typeof o.score === "number") pts += o.score;
    }
  });
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((pts / max) * 100))) : 0;
  return { pts, max, pct };
}

function buildAdvice(answers, sc) {
  const status = (answers.status || [])[0];
  const why = answers.why || [];
  const health = answers.health || [];
  const insulinAns = (answers.insulin || [])[0];
  const lines = [];

  lines.push('<p class="score-line"><strong>نسبة مطابقة فهمك لما يُنسب للنص الشائع:</strong> ' + sc.pct + '٪ <span class="mute">(' + sc.pts + '/' + sc.max + ')</span></p>');

  if (sc.pct >= 75) {
    lines.push('<p>فهمك قريب من الركائز المتداولة: وجبتان، فاصل ساعتين، أرز وبطاطس وتمر وسمن، واستبعاد الدجاج والبيض والبقول في كثير من النسخ.</p>');
  } else if (sc.pct >= 40) {
    lines.push('<p>فهم جزئي. النسخ المنشورة تختلف. الأهم: لا توقف دواءً موصوفاً، والفاصل بين الوجبات ليس بديلاً عن العلاج.</p>');
  } else {
    lines.push('<p>المطابقة ضعيفة مع النص الشائع. قبل أي تطبيق راجع مصادرك، ولا تعتمد على ملخصات مجموعات أو مقاطع قصيرة.</p>');
  }

  if (why.length && !why.includes('na')) {
    const map = {
      quran: 'الجانب الاسمي والديني قوي في الانتشار، لكنه لا يثبت سلامة القائمة طبياً.',
      cheap: 'التكلفة المنخفضة تفسّر الشعبية؛ الرخيص لا يعني آمناً لكل حالة.',
      weight: 'تحسّن ذاتي قد يأتي من تقليل المصنّعات أو تقليل عدد الوجبات، لا من قاعدة الساعتين وحدها.',
      diabetes: 'السكري يحتاج متابعة مخبرية ودوائية؛ أي حمية تُدار مع طبيبك لا بدلاً عنه.',
      trust: 'الثقة بالشخص لا تغني عن دليل سريري على الحزمة كاملة.',
      peer: 'توصية المحيط شائعة؛ القرار الطبي يبقى فردياً ومع طبيب.'
    };
    const items = why.filter((id) => map[id]).map((id) => '<li>' + map[id] + '</li>').join('');
    if (items) lines.push('<p><strong>أسباب ذكرتها:</strong></p><ul>' + items + '</ul>');
  }

  lines.push('<p><strong>نصيحة مبنية على بوابات Congress+:</strong></p><ul>');
  lines.push('<li><strong>أحمر — ارفض فوراً:</strong> إيقاف الإنسولين أو الغسيل الكلوي أو العلاج الكيماوي أو أي دواء مزمن من تلقاء نفسك. وزارة الصحة السعودية حذّرت من إيقاف الإنسولين بعد رصد حالات عناية مركزة.</li>');
  lines.push('<li><strong>أصفر — بحذر ومتابعة:</strong> تضييق قائمة الطعام مع الإبقاء على الدواء، ومراجعة تحاليل خلال أسابيع (سكر صائم أو تراكمي، ووظائف كلى إن لزم).</li>');
  lines.push('<li><strong>أخضر — أقل خطراً نسبياً:</strong> تقليل المشروبات الغازية والوجبات السريعة مع الإبقاء على ما يوصي به طبيبك من خضار وعلاج.</li>');
  lines.push('</ul>');

  if (health.includes('dm1') || insulinAns === 'stop') {
    lines.push('<p class="warn">تنبيه عالٍ: السكري المعتمد على إنسولين أو قرار إيقاف الإنسولين دون إشراف = خطر حماض كيتوني ومضاعفات حادة. لا تجرّب القائمة بديلاً عن الدواء.</p>');
  } else if (health.includes('dm2')) {
    lines.push('<p class="warn">سكري نوع 2: أي تغيير غذائي يُنسّق مع طبيبك؛ راقب السكر ولا تخفّض الجرعات وحدك.</p>');
  }
  if (health.includes('kidney')) {
    lines.push('<p class="warn">أمراض الكلى أو الغسيل: قيود البروتين والبوتاسيوم والسوائل طبية صارمة؛ لا تعتمد قائمة عامة من الإنترنت.</p>');
  }

  if (status === 'follow' || status === 'tried') {
    lines.push('<p>إن كنت مطبّقاً: سجّل الأعراض والوزن والسكر إن وُجد، ولا تؤخر الطوارئ عند دوخة شديدة أو قيء أو تنفّس سريع أو ألم في الصدر.</p>');
  }

  lines.push('<p class="mute">ملخص تعليمي من بوابات Congress+ وسجل الوفيات المسمّاة في هذه الصفحة. ليس تشخيصاً وليس بديلاً عن استشارة طبية.</p>');
  return lines.join('\n');
}

function renderSurvey() {
  const form = document.getElementById('survey-form');
  const out = document.getElementById('survey-out');
  if (!form) return;
  form.innerHTML = SURVEY.map((q) => {
    const type = q.multi ? 'checkbox' : 'radio';
    return '<fieldset class="sq" data-id="' + q.id + '">' +
      '<legend>' + q.q + '</legend>' +
      q.opts.map((o) =>
        '<label class="so"><input type="' + type + '" name="' + q.id + '" value="' + o.id + '" /><span>' + o.t + '</span></label>'
      ).join('') +
      '</fieldset>';
  }).join('') + '<button type="submit" class="sbtn">احسب المطابقة واعرض النصيحة</button>';

  form.onsubmit = (e) => {
    e.preventDefault();
    const answers = {};
    SURVEY.forEach((q) => {
      answers[q.id] = Array.prototype.slice.call(form.querySelectorAll('input[name="' + q.id + '"]:checked')).map((el) => el.value);
    });
    const sc = scoreSurvey(answers);
    out.innerHTML = '<article class="sresult">' + buildAdvice(answers, sc) + '</article>';
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}

window.renderSurvey = renderSurvey;
