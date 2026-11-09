export function validate(d) {
  const fail = message => { throw Error(message); };
  const text = s => typeof s === 'string' && s.trim().length > 0;
  if (!d || !text(d.title) || !text(d.version) || !Array.isArray(d.modules) || !d.modules.length || !Array.isArray(d.questions) || !d.questions.length) fail('Invalid course root');
  const ids = new Set(), qids = new Set();
  for (const m of d.modules) {
    if (!['id','title','summary','rule','pitfall','translation','analysis'].every(k => text(m[k])) || !['基础','定语从句','名词性从句','状语从句'].includes(m.group) || ids.has(m.id)) fail(`Invalid module: ${m.id}`);
    if (!Array.isArray(m.steps) || !m.steps.length || !m.steps.every(text) || !Array.isArray(m.example) || !m.example.length || !m.example.every(s => text(s.text) && ['main','clause','link','focus'].includes(s.role))) fail(`Invalid lesson: ${m.id}`);
    if (m.guide !== undefined && (!Array.isArray(m.guide) || !m.guide.every(g => g && ['term','detail','example'].every(k => text(g[k]))))) fail(`Invalid guide: ${m.id}`);
    ids.add(m.id);
  }
  for (const q of d.questions) {
    if (!['id','module','prompt','sentence','hint','explanation'].every(k => text(q[k])) || qids.has(q.id) || !ids.has(q.module) || ![1,2,3].includes(q.level) || !['choice','fill','repair'].includes(q.type)) fail(`Invalid question: ${q.id}`);
    if (!Array.isArray(q.answers) || !q.answers.length || !q.answers.every(text) || new Set(q.answers).size !== q.answers.length) fail(`Invalid answers: ${q.id}`);
    if (q.type === 'choice' && (!Array.isArray(q.options) || q.options.length < 3 || !q.options.every(text) || new Set(q.options).size !== q.options.length || q.answers.length !== 1 || !q.options.includes(q.answers[0]))) fail(`Ambiguous choice schema: ${q.id}`);
    qids.add(q.id);
  }
  for (const id of ids) if (!d.questions.some(q => q.module === id)) fail(`Module has no questions: ${id}`);
  return true;
}
