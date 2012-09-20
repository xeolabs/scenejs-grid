/**
 *
 */
var TankControl = function(tank) {

    var node = tank.containerNode;
    while (node && node.type != "lookAt") {
        node = node.parent;
    }

    if (!node) {
        throw "Failed to find 'lookAt' node for tank";
    }

    this.lookAtNode = node;

    this._scene = this.lookAtNode.getScene();
    this._canvas = this._scene.getCanvas();

    this.tank = tank;

    this._needUpdate = true;
    this._speed = 0;

    var lastX;
    var lastX2;
    var lastY2;
    var lastY;
    var dragging = false;

    this._tankYaw = 0;
    this._tankYawInc = 0;

    this._trailYaw = 0;
    this._trailYawInc = 0;

    this._pitch = 25;
    this._pitchInc = 0;

    var self = this;

    function mouseDown(event) {
        lastX = event.clientX;
        lastX2 = lastX;
        lastY2 = lastY;
        lastY = event.clientY;
        dragging = true;
    }

    function touchStart(event) {
        lastX = event.targetTouches[0].clientX;
        lastX2 = lastX;
        lastY2 = lastY;
        lastY = event.targetTouches[0].clientY;
        dragging = true;
    }

    function mouseUp() {
        dragging = false;
        self._tankYawInc = 0;
        self._pitchInc = 0;
    }

    function touchEnd() {
        dragging = false;
        self._tankYawInc = 0;
        self._pitchInc = 0;
    }

    function mouseMove(event) {
        var posX = event.clientX;
        var posY = event.clientY;
        actionMove(posX, posY);
    }

    function touchMove(event) {
        var posX = event.targetTouches[0].clientX;
        var posY = event.targetTouches[0].clientY;
        actionMove(posX, posY);
    }

    /* On a mouse/touch drag, we'll re-render the scene, passing in
     * incremented angles in each time.
     */
    function actionMove(posX, posY) {
        if (dragging) {
            self._tankYawInc = (posX - lastX) * -0.01;
            self._pitchInc = (lastY - posY) * 0.001;
            lastX2 = posX;
            lastY2 = posY;
        }
    }

    function mouseWheel(event) {

        var delta = 0;

        if (!event) {
            event = window.event;
        }

        if (event.wheelDelta) {
            delta = event.wheelDelta / 120;

            if (window.opera) {
                delta = -delta;
            }

        } else if (event.detail) {
            delta = -event.detail / 3;
        }

        if (delta) {
            if (delta < 0) {
                self._speed -= 0.2;
            } else {
                self._speed += 0.2;
            }
        }

        if (event.preventDefault) {
            event.preventDefault();
        }

        event.returnValue = false;
    }

    /**
     * Bind to mouse
     */
    this._canvas.addEventListener('mousedown', mouseDown, true);
    this._canvas.addEventListener('mousemove', mouseMove, true);
    this._canvas.addEventListener('mouseup', mouseUp, true);
    this._canvas.addEventListener('touchstart', touchStart, true);
    this._canvas.addEventListener('touchmove', touchMove, true);
    this._canvas.addEventListener('touchend', touchEnd, true);
    this._canvas.addEventListener('mousewheel', mouseWheel, true);
    this._canvas.addEventListener('DOMMouseScroll', mouseWheel, true);

    /**
     * Destroy when scene destroyed
     */
    this._sceneDestroyEventHandle = this._scene.onEvent(
            "destroyed",
            function() {
                self.destroy();
            });

    /**
     * Bind update to render loop
     */
    this._idleEventHandle = this._scene.onEvent(

            "idle",

            function() {

                if (!self._needUpdate && ( self._pitchInc == 0 && self._tankYawInc == 0 && self._speed == 0 && self._trailYaw == 0)) {
                    return;
                }

                self._needUpdate = false;

                self._pitch += self._pitchInc;

                if (self._pitch < 1) {
                    self._pitch = 1;
                }

                if (self._pitch > 80) {
                    self._pitch = 80;
                }

                self._tankYaw += self._tankYawInc;
                var tankYawMat = Matrix.Rotation(self._tankYaw * 0.0174532925, $V([0,1,0]));

                var moveVec = [0,0,1];

                moveVec = tankYawMat.multiply($V(moveVec)).elements;

                var trailVec = [0,0, -1 - (self._pitch * 0.03)];

                var trailPitchMat = Matrix.Rotation(self._pitch * 0.0174532925, $V([1,0,0]));
                var trailYawMat = Matrix.Rotation(self._trailYaw * 0.0174532925, $V([0,1,0]));

                trailVec = trailPitchMat.multiply($V(trailVec)).elements;
                trailVec = trailYawMat.multiply($V(trailVec)).elements;

                var tankPos = self.tank.getPos();

                if (self._speed) {
                    tankPos[0] += moveVec[0] * self._speed;
                    tankPos[1] += moveVec[1] * self._speed;
                    tankPos[2] += moveVec[2] * self._speed;
                }

                var eye = self.lookAtNode.getEye();

                if (eye.y > 100.0) {
                    eye.y = 100.0;
                }

                if (eye.y < 20.0) {
                    eye.y = 20.0;
                }

                eye.x = tankPos[0] + (trailVec[0] * 35);
                eye.y = tankPos[1] + (trailVec[1] * 35);
                eye.z = tankPos[2] + (trailVec[2] * 35);

                self.lookAtNode
                        .setEye(eye)
                        .setLook({ x:tankPos[0], y: tankPos[1], z: tankPos[2] });

                self.tank.setPos(tankPos);
                self.tank.setDir(self._tankYaw + 180 || 180);

                //   tankGunRotateNode.setAngle(-tankYaw);

                if (self._trailYaw > self._tankYaw) {
                    self._trailYaw -= (((self._trailYaw - self._tankYaw) * 0.01)) + 0.1;

                } else if (self._trailYaw < self._tankYaw) {
                    self._trailYaw += (((self._tankYaw - self._trailYaw) * 0.01)) + 0.1;
                }
            });

    /**
     * Destroys this mouse controller
     */
    this.destroy = function() {

        if (this._destroyed) {
            return;
        }

        this._destroyed = true;

        this._scene.unEvent(this._sceneDestroyEventHandle);
        this._scene.unEvent(this._idleEventHandle);

        this._canvas.removeEventListener('mousedown', mouseDown);
        this._canvas.removeEventListener('mousemove', mouseMove);
        this._canvas.removeEventListener('mouseup', mouseUp);
        this._canvas.removeEventListener('touchstart', touchStart);
        this._canvas.removeEventListener('touchmove', touchMove);
        this._canvas.removeEventListener('touchend', touchEnd);
        this._canvas.removeEventListener('mousewheel', mouseWheel);
        this._canvas.removeEventListener('DOMMouseScroll', mouseWheel);
    };

};