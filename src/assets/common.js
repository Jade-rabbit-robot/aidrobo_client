export const changeStr = function (res) {
  const { data, info: { width, height, resolution, origin: { position: { x, y } } } } = res
  const uint = (data) => {
    const uint8Array = new Uint8Array(data);
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(uint8Array);
  }
  return {
    src: uint(data),
    width,
    height,
    resolution,
    positionX: x,
    positionY: y,
  }
}
export const mapToImg = ({ mapData, y, x }) => {
  if (y) {
    return mapData.height - (y - mapData.positionY) / mapData.resolution;
  }
  if (x) {
    return (x - mapData.positionX) / mapData.resolution;
  }
}
export const imgToMap = ({ mapData, y, x }) => {
  console.log(' mapData, y, x', mapData)
  console.log('y',  y)
  console.log(' x',  x)
  if (y) {
    return(mapData.height - y) * mapData.resolution + mapData.positionY;
  }
  if (x) {
    return  x * mapData.resolution +  mapData.positionX;
  }
}
