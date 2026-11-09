# 课程与命题约定

## 数据结构

根对象为 `{version, title, modules, questions}`。version 是非空版本字符串。modules 中每项：

- `id`、`title`、`group`（基础 / 定语从句 / 名词性从句 / 状语从句）、`summary`。
- `rule`：简洁规则；`steps`：判断步骤数组；`pitfall`：易错点。
- `example`：`[{text, role}]`，role 为 main（主句）、clause（从句）、link（连接词）、focus（基础单元的关注成分）。拼接后必须是完整英文例句，保留必要空格。
- `translation`、`analysis`：例句翻译和结构说明。
- 可选 `guide`：`[{term, detail, example}]`，用于基础知识的速查条目；保持所有内容为纯文本，网页负责转义。

questions 中每项：`id`、`module`、`level`（1/2/3）、`type`（choice/fill/repair）、`prompt`（题干）、`sentence`（英文材料）、`answers`（所有允许的字符串答案）、`hint`、`explanation`。

choice 另有 `options` 数组，至少三个互不重复的字符串选项，只能有一个正确答案且答案必须属于选项。填空只留一个连续空缺，说明所需内容；repair 在题干中限定只改一个错误并要求输入完整句子，列出可接受的规范表达。每题解析至少说明结构、规则及误选原因。避免只写“固定搭配”。

## 从句命题检查

1. 定语从句：先行词 + 从句缺失成分；地点先行词不必用 where，时间先行词不必用 when。限定性从句中作宾语的关系词可能省略；非限定性从句不用 that，关系词不能省略。把这些多解情形做成多答案填空，或用明确语境限制单选。
2. 名词性从句：按全句中的功能区分主语、宾语、表语、同位语。that 引导陈述内容通常不充当从句成分；what 在从句中承担成分。宾语从句用陈述语序，但连接词本身作主语时要避免错误套用倒装判断。whether/if 的可替换性受位置和结构限制，不能说 if 永远不行。
3. 同位语从句：说明抽象名词内容，与修饰先行词的定语从句对比。不要仅凭名词后出现 that 就判断。
4. 状语从句：根据时间、条件、原因、让步、目的、结果等逻辑关系判断。“主将从现”限于常见的将来时间、真实条件语境，不泛化为所有从句。说明 although 与 but 不同时连接同一对分句；because 与 so 同理。
5. 受控改错：不把语法正确但风格不同的表达当错，不惩罚合理变体。若合法变体太多，改为单选或填空。
6. 三大从句综合：相同连接词放进不同结构，要求从功能推断，不能只背词表。

## 参考与原创性

示例题为原创教学题，不宣称为教材配套或真题。教材若由用户提供，保留其版本信息；不要大段复制受版权保护题库。以下来源用于核对规则，例句与练习自行创作：

- [British Council：非限定性定语从句](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/relative-clauses-non-defining-relative-clauses)
- [Cambridge：that 从句](https://dictionary.cambridge.org/grammar/british-grammar/that-clauses)
- [Cambridge：whether](https://dictionary.cambridge.org/grammar/british-grammar/whether)
- [Cambridge：限定与非限定定语从句](https://dictionary.cambridge.org/grammar/british-grammar/defining-and-non-)

这些链接是供作者核对的材料；学生网页离线功能不能依赖外网。
