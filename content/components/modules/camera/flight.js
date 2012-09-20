var Flight = function(camera, pos, ok) {

    this._camera = camera;
    this._ok = ok;

    this._velocity = 5;

    this._look1 = Tron_math_vec3ObjToArray(camera.getLook());
    this._eye1 = Tron_math_vec3ObjToArray(camera.getEye());
    this._up1 = Tron_math_vec3ObjToArray(camera.getUp());

    this._look2 = Tron_math_vec3ObjToArray(pos);

    this._vec = Tron_math_normalizeVec3(Tron_math_subVec3(this._eye1, this._look1));

    var dist = 2.5;
    var lenVec = Math.abs(Tron_math_lenVec3(this._vec));
    var len = 10.0;
    var sca = (len / lenVec) * dist;

    this._eye2 = Tron_math_addVec3(this._look2, Tron_math_mulVec3Scalar(this._vec, sca));
    this._up2 = [0, 1, 0];
    this._dist = Math.abs(Tron_math_lenVec3(Tron_math_subVec3(this._look2, this._look1)));
    this._duration = 1000.0 * ((this._dist / this._velocity) + 1);
};

/** Update the interpolation to push the next state to the bound {@link Human_camera}
 */
Flight.prototype.update = function(time) {

    if (this._time1 == undefined) {
        this._time1 = time;
        this._time2 = this._time1 + this._duration;
    }

    if (this._done || time > this._time2) {
        this._done = true;
        this._ok();
        return;
    }

    var easedTime = this._easeOut((time - this._time1) / this._duration, 0, 1, 1);

    var eye = Tron_math_lerpVec3(
            easedTime,
            0,
            1,
            this._eye1,
            this._eye2);

    var zoom;

    var f = 1.0 + Math.sin(((Math.PI * 2) * easedTime) - (Math.PI * 0.75));

    zoom = (this._dist * f * 0.2);

    eye = Tron_math_addVec3(eye, Tron_math_mulVec3Scalar(this._vec, zoom));

    this._camera.setEye(Tron_math_vec3ArrayToObj(eye));

    var look = Tron_math_vec3ArrayToObj(
            Tron_math_lerpVec3(
                    easedTime,
                    0,
                    1,
                    this._look1,
                    this._look2));

    this._camera.setLook(look);

    var up = Tron_math_vec3ArrayToObj(
            Tron_math_lerpVec3(
                    easedTime,
                    0,
                    1,
                    this._up1,
                    this._up2));

    //this._camera.setUp(up);
};

Flight.prototype._easeOut = function (t, b, c, d) {
    var ts = (t /= d) * t;
    var tc = ts * t;
    return b + c * (-1 * ts * ts + 4 * tc + -6 * ts + 4 * t);
};

Flight.prototype._easeIn = function (t, b, c, d) {
    var ts = (t /= d) * t;
    var tc = ts * t;
    return b + c * (tc * ts);
};

Flight.prototype.stop = function() {
    this._ok();
};