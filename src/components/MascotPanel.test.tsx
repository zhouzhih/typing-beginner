import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { MascotPanel } from './MascotPanel'

describe('MascotPanel', () => {
  test('lets a child buy and equip a reward with coins', async () => {
    const user = userEvent.setup()
    const onBuyReward = vi.fn()
    const onToggleReward = vi.fn()

    render(
      <MascotPanel
        coinBalance={45}
        customMascotImage=""
        equippedRewardIds={[]}
        level={2}
        onBuyReward={onBuyReward}
        onSelectMascot={vi.fn()}
        onToggleReward={onToggleReward}
        onUploadCustomMascot={vi.fn()}
        ownedRewardIds={['star-sticker']}
        selectedMascotId="keyboard-sprite"
      />,
    )

    await user.click(screen.getByRole('button', { name: '打开打字伙伴' }))

    expect(screen.getByText('金币 45')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '购买 键帽皇冠 35 金币' }))
    await user.click(screen.getByRole('button', { name: '佩戴 星星贴纸' }))

    expect(onBuyReward).toHaveBeenCalledWith('keycap-crown')
    expect(onToggleReward).toHaveBeenCalledWith('star-sticker')
  })
})
