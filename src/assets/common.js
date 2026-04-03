export const changeStr = function (res) {
  const { data, info: { width, height, resolution, origin: { position: { x, y } } } } = res
  const uint = (data) => {
    const uint8Array = new Uint8Array(data);
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(uint8Array);
  }
  return {
    src: 'data:image/jpg;base64,'+uint(data),
    width,
    height,
    resolution,
    positionX: x,
    positionY: y,
  }
}
export const mapToImg = ({ mapData, y, x }) => {
  if (y !== undefined) {
    return mapData.height - (y - mapData.positionY) / mapData.resolution;
  }
  if (x !== undefined) {
    return (x - mapData.positionX) / mapData.resolution;
  }
}
export const imgToMap = ({ mapData, y, x }) => {
  if (y !== undefined) {
    return(mapData.height - y) * mapData.resolution + mapData.positionY;
  }
  if (x !== undefined) {
    return  x * mapData.resolution +  mapData.positionX;
  }
}
export const normalizeFrameId = (frameId = '') => String(frameId).replace(/^\//, '')

export const quaternionToYawRad = (orientation = {}) => {
  const x = Number(orientation.x || 0)
  const y = Number(orientation.y || 0)
  const z = Number(orientation.z || 0)
  const w = Number(orientation.w || 1)
  const sinyCosp = 2 * (w * z + x * y)
  const cosyCosp = 1 - 2 * (y * y + z * z)
  return Math.atan2(sinyCosp, cosyCosp)
}

export const quaternionToYawDeg = (orientation = {}) => {
  return (quaternionToYawRad(orientation) * 180) / Math.PI
}

export const createQuaternionFromYaw = (yaw = 0) => {
  const angle = Number(yaw || 0)
  return {
    x: 0,
    y: 0,
    z: Math.sin(angle / 2),
    w: Math.cos(angle / 2)
  }
}

export const resolvePatrolPointYaw = (point = {}, nextPoint = null, previousPoint = null) => {
  const yaw = Number(point.yaw)
  if (Number.isFinite(yaw)) {
    return yaw
  }

  const angle = Number(point.angle)
  if (Number.isFinite(angle)) {
    return angle
  }

  const orientation = point.orientation
  if (orientation) {
    return quaternionToYawRad(orientation)
  }

  if (nextPoint) {
    return Math.atan2(Number(nextPoint.y) - Number(point.y), Number(nextPoint.x) - Number(point.x))
  }

  if (previousPoint) {
    return Math.atan2(Number(point.y) - Number(previousPoint.y), Number(point.x) - Number(previousPoint.x))
  }

  return 0
}

export const normalizePatrolPoint = (point = {}, nextPoint = null, previousPoint = null) => {
  const normalizedPoint = {
    ...point,
    x: Number(point.x || 0),
    y: Number(point.y || 0),
    z: Number(point.z || 0)
  }
  const yaw = resolvePatrolPointYaw(normalizedPoint, nextPoint, previousPoint)

  return {
    ...normalizedPoint,
    yaw,
    orientation: createQuaternionFromYaw(yaw)
  }
}

export const normalizePatrolPoints = (points = []) => points.map((point, index) => normalizePatrolPoint(
  point,
  points[index + 1] || null,
  points[index - 1] || null
))

export const rotatePointByQuaternion = (point, quaternion = {}) => {
  const vector = {
    x: Number(point.x || 0),
    y: Number(point.y || 0),
    z: Number(point.z || 0)
  }
  const qx = Number(quaternion.x || 0)
  const qy = Number(quaternion.y || 0)
  const qz = Number(quaternion.z || 0)
  const qw = Number(quaternion.w || 1)
  const dotUV = qx * vector.x + qy * vector.y + qz * vector.z
  const dotUU = qx * qx + qy * qy + qz * qz
  const cross = {
    x: qy * vector.z - qz * vector.y,
    y: qz * vector.x - qx * vector.z,
    z: qx * vector.y - qy * vector.x
  }

  return {
    x: 2 * dotUV * qx + (qw * qw - dotUU) * vector.x + 2 * qw * cross.x,
    y: 2 * dotUV * qy + (qw * qw - dotUU) * vector.y + 2 * qw * cross.y,
    z: 2 * dotUV * qz + (qw * qw - dotUU) * vector.z + 2 * qw * cross.z
  }
}

export const applyTransformToPoint = (point, transform = {}) => {
  const rotated = rotatePointByQuaternion(point, transform.rotation)
  const translation = transform.translation || {}

  return {
    x: rotated.x + Number(translation.x || 0),
    y: rotated.y + Number(translation.y || 0),
    z: rotated.z + Number(translation.z || 0)
  }
}

export const invertQuaternion = (quaternion = {}) => ({
  x: -Number(quaternion.x || 0),
  y: -Number(quaternion.y || 0),
  z: -Number(quaternion.z || 0),
  w: Number(quaternion.w || 1)
})

export const composeQuaternions = (left = {}, right = {}) => {
  const ax = Number(left.x || 0)
  const ay = Number(left.y || 0)
  const az = Number(left.z || 0)
  const aw = Number(left.w || 1)
  const bx = Number(right.x || 0)
  const by = Number(right.y || 0)
  const bz = Number(right.z || 0)
  const bw = Number(right.w || 1)

  return {
    x: aw * bx + ax * bw + ay * bz - az * by,
    y: aw * by - ax * bz + ay * bw + az * bx,
    z: aw * bz + ax * by - ay * bx + az * bw,
    w: aw * bw - ax * bx - ay * by - az * bz
  }
}

export const invertTransform = (transform = {}) => {
  const rotation = invertQuaternion(transform.rotation)
  const translation = rotatePointByQuaternion({
    x: -Number((transform.translation || {}).x || 0),
    y: -Number((transform.translation || {}).y || 0),
    z: -Number((transform.translation || {}).z || 0)
  }, rotation)

  return { translation, rotation }
}

export const composeTransforms = (left = {}, right = {}) => ({
  translation: applyTransformToPoint(right.translation || {}, left),
  rotation: composeQuaternions(left.rotation, right.rotation)
})

export const buildTransformFromStamped = (transformStamped = {}) => ({
  translation: {
    x: Number((((transformStamped.transform || {}).translation || {}).x) || 0),
    y: Number((((transformStamped.transform || {}).translation || {}).y) || 0),
    z: Number((((transformStamped.transform || {}).translation || {}).z) || 0)
  },
  rotation: {
    x: Number((((transformStamped.transform || {}).rotation || {}).x) || 0),
    y: Number((((transformStamped.transform || {}).rotation || {}).y) || 0),
    z: Number((((transformStamped.transform || {}).rotation || {}).z) || 0),
    w: Number((((transformStamped.transform || {}).rotation || {}).w) || 1)
  }
})

export const updateTransformGraph = (graph, transforms = []) => {
  transforms.forEach(item => {
    const parent = normalizeFrameId((item.header || {}).frame_id)
    const child = normalizeFrameId(item.child_frame_id)
    if (!parent || !child) {
      return
    }
    graph[`${parent}->${child}`] = buildTransformFromStamped(item)
  })
}

export const resolveTransform = (graph, fromFrame, toFrame) => {
  const start = normalizeFrameId(fromFrame)
  const target = normalizeFrameId(toFrame)
  if (!start || !target) {
    return null
  }
  if (start === target) {
    return {
      translation: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 }
    }
  }

  const visited = new Set([start])
  const queue = [{ frame: start, transform: null }]

  while (queue.length) {
    const current = queue.shift()
    const frame = current.frame

    const keys = Object.keys(graph)
    for (let index = 0; index < keys.length; index += 1) {
      const key = keys[index]
      const [parent, child] = key.split('->')
      let nextFrame = null
      let edgeTransform = null

      if (parent === frame) {
        nextFrame = child
        edgeTransform = graph[key]
      } else if (child === frame) {
        nextFrame = parent
        edgeTransform = invertTransform(graph[key])
      }

      if (!nextFrame || visited.has(nextFrame)) {
        continue
      }

      const nextTransform = current.transform
        ? composeTransforms(current.transform, edgeTransform)
        : edgeTransform

      if (nextFrame === target) {
        return nextTransform
      }

      visited.add(nextFrame)
      queue.push({ frame: nextFrame, transform: nextTransform })
    }
  }

  return null
}

export const routerObj={
  'home':'首页',
  'map':'地图管理',
  'newMap':"新建地图",
  'editMap':"编辑地图",
  'seeMap':"查看地图",
  'site':"设置",
  'utility':"应用功能",
  'relocation':"重定位",
  'goPoint':"去位置点",
  'navigation':"定点导航",
  'telecontrol':"遥控",
  'screen': "展示大屏",
}
