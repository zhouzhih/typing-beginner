import type { MascotId } from '../domain/mascot'
import forestRangerImage from '../assets/mascots/forest-ranger.svg'
import keyboardSpriteImage from '../assets/mascots/keyboard-sprite.svg'
import pixelHeroImage from '../assets/mascots/pixel-hero.svg'
import redCrafterImage from '../assets/mascots/red-crafter.svg'
import roundBeanImage from '../assets/mascots/round-bean.svg'

export type Mascot = {
  id: MascotId
  name: string
  description: string
  imageSrc: string
}

export const mascots: Mascot[] = [
  {
    id: 'keyboard-sprite',
    name: '键盘小精灵',
    description: '最懂键盘的小伙伴。',
    imageSrc: keyboardSpriteImage,
  },
  {
    id: 'round-bean',
    name: '圆滚派对小豆',
    description: '圆圆的、爱收集星星。',
    imageSrc: roundBeanImage,
  },
  {
    id: 'red-crafter',
    name: '红帽小工匠',
    description: '喜欢修键盘和闯关。',
    imageSrc: redCrafterImage,
  },
  {
    id: 'pixel-hero',
    name: '像素小勇士',
    description: '复古小游戏风的练习伙伴。',
    imageSrc: pixelHeroImage,
  },
  {
    id: 'forest-ranger',
    name: '森林小游侠',
    description: '带着背包去探索新关卡。',
    imageSrc: forestRangerImage,
  },
]

export function getMascotById(mascotId: MascotId): Mascot {
  return mascots.find((mascot) => mascot.id === mascotId) ?? mascots[0]
}
