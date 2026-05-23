const keyboardTips = [
  {
    keyName: 'Shift',
    title: '打大写字母',
    description: '按住 Shift 再按字母，就能输入大写。先慢慢按稳，再追求速度。',
  },
  {
    keyName: 'Backspace',
    title: '改正小错误',
    description: '打错了可以退一格修改。练习时小错误会保留，帮助看到进步。',
  },
  {
    keyName: '空格',
    title: '单词要分开',
    description: '英文单词之间要轻按空格，空格也是很重要的按键。',
  },
]

export function KeyboardTips() {
  return (
    <section className="side-card keyboard-tips-card" aria-labelledby="keyboard-tips-title">
      <div className="section-label">键盘小知识</div>
      <h2 id="keyboard-tips-title">键盘小知识</h2>
      <ul className="keyboard-tip-list">
        {keyboardTips.map((tip) => (
          <li key={tip.keyName}>
            <span className="keycap">{tip.keyName}</span>
            <div>
              <strong>{tip.title}</strong>
              <p>{tip.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
