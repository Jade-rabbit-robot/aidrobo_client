const ros = new ROSLIB.Ros();
ros.connect('ws://192.168.2.220:9090');
/** 模式切换 */
const robotMode = new ROSLIB.Service({
  ros: ros,
  name: '/mode_set',
  serviceType: 'aid_robot_msgs/srv/StatusChange'
});

/** 建图订阅 */
const robotMap = new ROSLIB.Topic({
  ros: ros,
  name: '/map_base64',
  messageType: 'nav_msgs/msg/OccupancyGrid'
});
/** 建图结束 */
const finishMap = new ROSLIB.Service({
  ros: ros,
  name: '/finish_trajectory',
  serviceType: 'cartographer_ros_msgs/srv/FinishTrajectory'
});
/** 保存建图文件 */
const saveMapFile = new ROSLIB.Service({
  ros: ros,
  name: '/write_state',
  serviceType: 'cartographer_ros_msgs/srv/WriteState'
});
/** 建图集成保存 */
const saveMap = new ROSLIB.Service({
  ros: ros,
  name: '/aid_save_map',
  serviceType: 'aid_robot_msgs/srv/MapOperation'
});
/** 保存建图db */
const saveMapDb = new ROSLIB.Service({
  ros: ros,
  name: '/add_map',
  serviceType: 'aid_robot_msgs/srv/MapOperationAdd'
});
/** 获取地图列表 */
const getMapList = new ROSLIB.Service({
  ros: ros,
  name: '/get_map_list',
  serviceType: 'aid_robot_msgs/srv/MapList'
});
/** 删除地图 */
const deleteMap = new ROSLIB.Service({
  ros: ros,
  name: '/delete_map',
  serviceType: 'aid_robot_msgs/srv/OperationDelete'
});
/** 更新地图 */
const updateMap = new ROSLIB.Service({
  ros: ros,
  name: '/update_map',
  serviceType: 'aid_robot_msgs/srv/OperationUpdate'
});
/** 获取地图数据 */
const getMapImage = new ROSLIB.Service({
  ros: ros,
  name: '/get_map_image',
  serviceType: 'aid_robot_msgs/srv/MapImage'
});
/** 设置当前地图为使用中的地图 */
const setCurrentMapId = new ROSLIB.Service({
  ros: ros,
  name: '/set_current_map_id',
  serviceType: 'aid_robot_msgs/srv/SetCurrentMap'
});
/** 获取当前使用中的地图id */
const getCurrentMapId = new ROSLIB.Service({
  ros: ros,
  name: '/get_current_map_id',
  serviceType: 'aid_robot_msgs/srv/GetCurrentMap'
});
/** 机器人在地图中位置*/
const robotPosition = new ROSLIB.Topic({
  ros: ros,
  name: '/base_link_pose',
  messageType: 'geometry_msgs/msg/PoseStamped'
});
/** 重定位*/
const PoseStamped = new ROSLIB.Topic({
  ros: ros,
  name: '/goal_pose',
  messageType: 'geometry_msgs/msg/PoseStamped'
});
/** 发送位置点*/
const TalkerPoint = new ROSLIB.Topic({
  ros: ros,
  name: '/patrol_path',
  messageType: 'nav_msgs/msg/Path'
});
/** 停止 */
const stopPatrol = new ROSLIB.Topic({
  ros: ros,
  name: '/stop_patrol',
  messageType: 'std_msgs/Empty'
});
ros.on('connection', function () {
  console.log('rosOk!!!');
});
