import { EffectFlags, type EffectScope, ReactiveEffect } from '@vue/reactivity'
import {
  type SchedulerJob,
  currentInstance,
  queueJob,
  queuePostFlushCb,
  setCurrentInstance,
  startMeasure,
  warn,
} from '@vue/runtime-dom'
import { type VaporComponentInstance, isVaporComponent } from './component'
import { invokeArrayFns } from '@vue/shared'

export class RenderEffect extends ReactiveEffect {
  i: VaporComponentInstance | null
  job: SchedulerJob
  updateJob: SchedulerJob

  constructor(public render: () => void) {
    super()
    const instance = currentInstance as VaporComponentInstance | null

    const job: SchedulerJob = () => {
      if (this.dirty) {
        this.run()
      }
    }

    this.updateJob = () => {
      instance!.isUpdating = false
      instance!.u && invokeArrayFns(instance!.u)
    }

    if (instance) {
      job.i = instance
    }

    this.job = job
    this.i = instance
  }

  fn(): void {
    const instance = this.i
    const scope = this.subs ? (this.subs.sub as EffectScope) : undefined
    // renderEffect is always called after user has registered all hooks
    const hasUpdateHooks = instance && (instance.bu || instance.u)
 
    const prev = setCurrentInstance(instance, scope)
    if (hasUpdateHooks && instance.isMounted && !instance.isUpdating) {
      instance.isUpdating = true
      instance.bu && invokeArrayFns(instance.bu)
      this.render()
      queuePostFlushCb(this.updateJob)
    } else {
      this.render()
    }
    setCurrentInstance(...prev)
 
  }

  notify(): void {
    const flags = this.flags
    if (!(flags & EffectFlags.PAUSED)) {
      queueJob(this.job, this.i ? this.i.uid : undefined)
    }
  }
}

export function renderEffect(fn: () => void, noLifecycle = false): void {
  const effect = new RenderEffect(fn)
  if (noLifecycle) {
    effect.fn = fn
  }
  effect.run()
}
