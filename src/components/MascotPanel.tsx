import { useState, type ChangeEvent } from 'react'

import { getMascotById, mascots } from '../data/mascots'
import {
  getRewardsByIds,
  rewards as rewardCatalog,
  type MascotId,
  type MascotReward,
  type RewardId,
} from '../domain/mascot'

type MascotPanelProps = {
  selectedMascotId: MascotId
  customMascotImage: string
  level: number
  coinBalance: number
  ownedRewardIds: RewardId[]
  equippedRewardIds: RewardId[]
  onSelectMascot: (mascotId: MascotId) => void
  onUploadCustomMascot: (imageDataUrl: string) => void
  onBuyReward: (rewardId: RewardId) => void
  onToggleReward: (rewardId: RewardId) => void
}

type MascotAvatarProps = Pick<
  MascotPanelProps,
  'customMascotImage' | 'equippedRewardIds' | 'selectedMascotId'
> & {
  celebrating?: boolean
  decorative?: boolean
  size?: 'small' | 'large'
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result)))
    reader.addEventListener('error', () => reject(reader.error))
    reader.readAsDataURL(file)
  })
}

function AccessoryLayer({ rewards }: { rewards: MascotReward[] }) {
  const rewardIds = new Set(rewards.map((reward) => reward.id))

  return (
    <>
      {rewardIds.has('hero-cape') ? <div className="mascot-cape" aria-hidden="true" /> : null}
      {rewardIds.has('keycap-crown') ? (
        <div className="mascot-crown" aria-hidden="true">
          ⌘
        </div>
      ) : null}
      {rewardIds.has('star-sticker') ? (
        <div className="mascot-sticker" aria-hidden="true">
          ★
        </div>
      ) : null}
      {rewardIds.has('gold-medal') ? <div className="mascot-medal" aria-hidden="true" /> : null}
    </>
  )
}

function MascotAvatar({
  celebrating = false,
  customMascotImage,
  decorative = false,
  equippedRewardIds,
  selectedMascotId,
  size = 'large',
}: MascotAvatarProps) {
  const selectedMascot =
    selectedMascotId === 'custom' && customMascotImage ? null : getMascotById(selectedMascotId)
  const imageSrc =
    customMascotImage && selectedMascotId === 'custom'
      ? customMascotImage
      : selectedMascot?.imageSrc ?? getMascotById('keyboard-sprite').imageSrc
  const imageAlt = selectedMascot?.name ? `${selectedMascot.name}头像` : '本机自定义头像'

  return (
    <div
      className={`mascot-stage ${size === 'small' ? 'mascot-stage-small' : ''} ${
        celebrating ? 'celebrating' : ''
      }`}
    >
      <img
        alt={decorative ? '' : imageAlt}
        aria-hidden={decorative ? 'true' : undefined}
        className="mascot-image"
        src={imageSrc}
      />
      <AccessoryLayer rewards={getRewardsByIds(equippedRewardIds)} />
    </div>
  )
}

export function MascotPanel({
  selectedMascotId,
  customMascotImage,
  level,
  coinBalance,
  ownedRewardIds,
  equippedRewardIds,
  onSelectMascot,
  onUploadCustomMascot,
  onBuyReward,
  onToggleReward,
}: MascotPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [cheerCount, setCheerCount] = useState(0)
  const ownedRewardSet = new Set(ownedRewardIds)
  const equippedRewardSet = new Set(equippedRewardIds)

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    onUploadCustomMascot(await readFileAsDataUrl(file))
  }

  const selectedMascot = selectedMascotId === 'custom' ? null : getMascotById(selectedMascotId)
  const mascotName = selectedMascot?.name ?? '本机自定义头像'

  return (
    <>
      <button
        aria-label="打开打字伙伴"
        className="mascot-trigger"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <MascotAvatar
          customMascotImage={customMascotImage}
          decorative
          equippedRewardIds={equippedRewardIds}
          selectedMascotId={selectedMascotId}
          size="small"
        />
        <span>
          <em>打字伙伴</em>
          <strong>Lv.{level}</strong>
        </span>
      </button>

      {isOpen ? (
        <div className="mascot-backdrop" onClick={() => setIsOpen(false)}>
          <section
            aria-labelledby="mascot-heading"
            aria-modal="true"
            className="mascot-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="关闭打字伙伴"
              className="mascot-close"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              ×
            </button>

            <div className="mascot-copy">
              <p className="eyebrow">右上角伙伴</p>
              <h2 id="mascot-heading">打字伙伴</h2>
              <p>{mascotName}</p>
              <strong>Lv.{level}</strong>
            </div>

            <button
              aria-label="和伙伴击掌"
              className="mascot-play-button"
              onClick={() => setCheerCount((count) => count + 1)}
              type="button"
            >
              <MascotAvatar
                celebrating={cheerCount > 0}
                customMascotImage={customMascotImage}
                equippedRewardIds={equippedRewardIds}
                selectedMascotId={selectedMascotId}
              />
            </button>
            {cheerCount > 0 ? (
              <p className="mascot-reaction" role="status">
                伙伴开心 +{cheerCount}
              </p>
            ) : null}

            <label className="mascot-field">
              <span>选择打字伙伴</span>
              <select
                aria-label="选择打字伙伴"
                onChange={(event) => onSelectMascot(event.target.value as MascotId)}
                value={selectedMascotId}
              >
                {mascots.map((mascot) => (
                  <option key={mascot.id} value={mascot.id}>
                    {mascot.name}
                  </option>
                ))}
                <option value="custom">本机自定义头像</option>
              </select>
            </label>

            <label className="upload-button">
              上传本机头像
              <input accept="image/*" aria-label="上传本机头像" onChange={handleUpload} type="file" />
            </label>
            <p className="local-note">自定义头像只保存在本机</p>

            <div className="reward-shop" aria-label="小道具商店">
              <div className="shop-heading">
                <strong>小道具商店</strong>
                <span>金币 {coinBalance}</span>
              </div>
              {rewardCatalog.map((reward) => {
                const isOwned = ownedRewardSet.has(reward.id)
                const isEquipped = equippedRewardSet.has(reward.id)
                const isLocked = level < reward.unlockLevel
                const canBuy = !isLocked && coinBalance >= reward.cost
                const buttonText = isLocked
                  ? `Lv.${reward.unlockLevel}解锁`
                  : isOwned
                    ? isEquipped
                      ? `取下 ${reward.title}`
                      : `佩戴 ${reward.title}`
                    : `购买 ${reward.title} ${reward.cost} 金币`

                return (
                  <div className="reward-shop-row" key={reward.id}>
                    <span>
                      {reward.title}
                      <small>Lv.{reward.unlockLevel}</small>
                    </span>
                    <button
                      disabled={isLocked || (!isOwned && !canBuy)}
                      onClick={() => (isOwned ? onToggleReward(reward.id) : onBuyReward(reward.id))}
                      type="button"
                    >
                      {buttonText}
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
