
        
                const i32 = (v) => v
                const f32 = i32
                const f64 = i32
                
function toInt(v) {
                    return v
                }
function toFloat(v) {
                    return v
                }
function createFloatArray(length) {
                    return new Float64Array(length)
                }
function setFloatDataView(dataView, position, value) {
                    dataView.setFloat64(position, value)
                }
function getFloatDataView(dataView, position) {
                    return dataView.getFloat64(position)
                }
const SKED_ID_NULL = -1
const SKED_ID_COUNTER_INIT = 1
const _SKED_WAIT_IN_PROGRESS = 0
const _SKED_WAIT_OVER = 1
const _SKED_MODE_WAIT = 0
const _SKED_MODE_SUBSCRIBE = 1


function sked_create(isLoggingEvents) {
            return {
                eventLog: new Set(),
                events: new Map(),
                requests: new Map(),
                idCounter: SKED_ID_COUNTER_INIT,
                isLoggingEvents,
            }
        }
function sked_wait(skeduler, event, callback) {
            if (skeduler.isLoggingEvents === false) {
                throw new Error("Please activate skeduler's isLoggingEvents")
            }

            if (skeduler.eventLog.has(event)) {
                callback(event)
                return SKED_ID_NULL
            } else {
                return _sked_createRequest(skeduler, event, callback, _SKED_MODE_WAIT)
            }
        }
function sked_wait_future(skeduler, event, callback) {
            return _sked_createRequest(skeduler, event, callback, _SKED_MODE_WAIT)
        }
function sked_subscribe(skeduler, event, callback) {
            return _sked_createRequest(skeduler, event, callback, _SKED_MODE_SUBSCRIBE)
        }
function sked_emit(skeduler, event) {
            if (skeduler.isLoggingEvents === true) {
                skeduler.eventLog.add(event)
            }
            if (skeduler.events.has(event)) {
                const skedIds = skeduler.events.get(event)
                const skedIdsStaying = []
                for (let i = 0; i < skedIds.length; i++) {
                    if (skeduler.requests.has(skedIds[i])) {
                        const request = skeduler.requests.get(skedIds[i])
                        request.callback(event)
                        if (request.mode === _SKED_MODE_WAIT) {
                            skeduler.requests.delete(request.id)
                        } else {
                            skedIdsStaying.push(request.id)
                        }
                    }
                }
                skeduler.events.set(event, skedIdsStaying)
            }
        }
function sked_cancel(skeduler, id) {
            skeduler.requests.delete(id)
        }
function _sked_createRequest(skeduler, event, callback, mode) {
            const id = _sked_nextId(skeduler)
            const request = {
                id, 
                mode, 
                callback,
            }
            skeduler.requests.set(id, request)
            if (!skeduler.events.has(event)) {
                skeduler.events.set(event, [id])    
            } else {
                skeduler.events.get(event).push(id)
            }
            return id
        }
function _sked_nextId(skeduler) {
            return skeduler.idCounter++
        }
const _commons_FRAME_SKEDULER = sked_create(false)
function _commons_emitFrame(frame) {
            sked_emit(_commons_FRAME_SKEDULER, frame.toString())
        }
function commons_waitFrame(frame, callback) {
            return sked_wait_future(_commons_FRAME_SKEDULER, frame.toString(), callback)
        }
function commons_cancelWaitFrame(id) {
            sked_cancel(_commons_FRAME_SKEDULER, id)
        }
const MSG_FLOAT_TOKEN = "number"
const MSG_STRING_TOKEN = "string"
function msg_create(template) {
                    const m = []
                    let i = 0
                    while (i < template.length) {
                        if (template[i] === MSG_STRING_TOKEN) {
                            m.push('')
                            i += 2
                        } else if (template[i] === MSG_FLOAT_TOKEN) {
                            m.push(0)
                            i += 1
                        }
                    }
                    return m
                }
function msg_getLength(message) {
                    return message.length
                }
function msg_getTokenType(message, tokenIndex) {
                    return typeof message[tokenIndex]
                }
function msg_isStringToken(message, tokenIndex) {
                    return msg_getTokenType(message, tokenIndex) === 'string'
                }
function msg_isFloatToken(message, tokenIndex) {
                    return msg_getTokenType(message, tokenIndex) === 'number'
                }
function msg_isMatching(message, tokenTypes) {
                    return (message.length === tokenTypes.length) 
                        && message.every((v, i) => msg_getTokenType(message, i) === tokenTypes[i])
                }
function msg_writeFloatToken(message, tokenIndex, value) {
                    message[tokenIndex] = value
                }
function msg_writeStringToken(message, tokenIndex, value) {
                    message[tokenIndex] = value
                }
function msg_readFloatToken(message, tokenIndex) {
                    return message[tokenIndex]
                }
function msg_readStringToken(message, tokenIndex) {
                    return message[tokenIndex]
                }
function msg_floats(values) {
                    return values
                }
function msg_strings(values) {
                    return values
                }
function msg_display(message) {
                    return '[' + message
                        .map(t => typeof t === 'string' ? '"' + t + '"' : t.toString())
                        .join(', ') + ']'
                }
function msg_isBang(message) {
            return (
                msg_isStringToken(message, 0) 
                && msg_readStringToken(message, 0) === 'bang'
            )
        }
function msg_bang() {
            const message = msg_create([MSG_STRING_TOKEN, 4])
            msg_writeStringToken(message, 0, 'bang')
            return message
        }
function msg_emptyToBang(message) {
            if (msg_getLength(message) === 0) {
                return msg_bang()
            } else {
                return message
            }
        }
const MSG_BUSES = new Map()
function msgBusPublish(busName, message) {
            let i = 0
            const callbacks = MSG_BUSES.has(busName) ? MSG_BUSES.get(busName): []
            for (i = 0; i < callbacks.length; i++) {
                callbacks[i](message)
            }
        }
function msgBusSubscribe(busName, callback) {
            if (!MSG_BUSES.has(busName)) {
                MSG_BUSES.set(busName, [])
            }
            MSG_BUSES.get(busName).push(callback)
        }
function msgBusUnsubscribe(busName, callback) {
            if (!MSG_BUSES.has(busName)) {
                return
            }
            const callbacks = MSG_BUSES.get(busName)
            const found = callbacks.indexOf(callback) !== -1
            if (found !== -1) {
                callbacks.splice(found, 1)
            }
        }
function msg_copyTemplate(src, start, end) {
            const template = []
            for (let i = start; i < end; i++) {
                const tokenType = msg_getTokenType(src, i)
                template.push(tokenType)
                if (tokenType === MSG_STRING_TOKEN) {
                    template.push(msg_readStringToken(src, i).length)
                }
            }
            return template
        }
function msg_copyMessage(src, dest, srcStart, srcEnd, destStart) {
            let i = srcStart
            let j = destStart
            for (i, j; i < srcEnd; i++, j++) {
                if (msg_getTokenType(src, i) === MSG_STRING_TOKEN) {
                    msg_writeStringToken(dest, j, msg_readStringToken(src, i))
                } else {
                    msg_writeFloatToken(dest, j, msg_readFloatToken(src, i))
                }
            }
        }
function msg_slice(message, start, end) {
            if (msg_getLength(message) <= start) {
                throw new Error('message empty')
            }
            const template = msg_copyTemplate(message, start, end)
            const newMessage = msg_create(template)
            msg_copyMessage(message, newMessage, start, end, 0)
            return newMessage
        }
function msg_concat(message1, message2) {
            const newMessage = msg_create(msg_copyTemplate(message1, 0, msg_getLength(message1)).concat(msg_copyTemplate(message2, 0, msg_getLength(message2))))
            msg_copyMessage(message1, newMessage, 0, msg_getLength(message1), 0)
            msg_copyMessage(message2, newMessage, 0, msg_getLength(message2), msg_getLength(message1))
            return newMessage
        }
function msg_shift(message) {
            switch (msg_getLength(message)) {
                case 0:
                    throw new Error('message empty')
                case 1:
                    return msg_create([])
                default:
                    return msg_slice(message, 1, msg_getLength(message))
            }
        }
function msg_isAction(message, action) {
            return msg_isMatching(message, [MSG_STRING_TOKEN])
                && msg_readStringToken(message, 0) === action
        }
function computeUnitInSamples(sampleRate, amount, unit) {
        if (unit === 'msec' || unit === 'millisecond') {
            return amount / 1000 * sampleRate
        } else if (unit === 'sec' || unit === 'seconds' || unit === 'second') {
            return amount * sampleRate
        } else if (unit === 'min' || unit === 'minutes' || unit === 'minute') {
            return amount * 60 * sampleRate
        } else if (unit === 'samp' || unit === 'samples' || unit === 'sample') {
            return amount
        } else {
            throw new Error("invalid time unit : " + unit)
        }
    }

function interpolateLin(x, p0, p1) {
            return p0.y + (x - p0.x) * (p1.y - p0.y) / (p1.x - p0.x)
        }

function computeSlope(p0, p1) {
            return p1.x !== p0.x ? (p1.y - p0.y) / (p1.x - p0.x) : 0
        }
function removePointsBeforeFrame(points, frame) {
            const newPoints = []
            let i = 0
            while (i < points.length) {
                if (frame <= points[i].x) {
                    newPoints.push(points[i])
                }
                i++
            }
            return newPoints
        }
function insertNewLinePoints(points, p0, p1) {
            const newPoints = []
            let i = 0
            
            // Keep the points that are before the new points added
            while (i < points.length && points[i].x <= p0.x) {
                newPoints.push(points[i])
                i++
            }
            
            // Find the start value of the start point :
            
            // 1. If there is a previous point and that previous point
            // is on the same frame, we don't modify the start point value.
            // (represents a vertical line).
            if (0 < i - 1 && points[i - 1].x === p0.x) {

            // 2. If new points are inserted in between already existing points 
            // we need to interpolate the existing line to find the startValue.
            } else if (0 < i && i < points.length) {
                newPoints.push({
                    x: p0.x,
                    y: interpolateLin(p0.x, points[i - 1], points[i])
                })

            // 3. If new line is inserted after all existing points, 
            // we just take the value of the last point
            } else if (i >= points.length && points.length) {
                newPoints.push({
                    x: p0.x,
                    y: points[points.length - 1].y,
                })

            // 4. If new line placed in first position, we take the defaultStartValue.
            } else if (i === 0) {
                newPoints.push({
                    x: p0.x,
                    y: p0.y,
                })
            }
            
            newPoints.push({
                x: p1.x,
                y: p1.y,
            })
            return newPoints
        }
function computeFrameAjustedPoints(points) {
            if (points.length < 2) {
                throw new Error('invalid length for points')
            }

            const newPoints = []
            let i = 0
            let p = points[0]
            let frameLower = 0
            let frameUpper = 0
            
            while(i < points.length) {
                p = points[i]
                frameLower = Math.floor(p.x)
                frameUpper = frameLower + 1

                // I. Placing interpolated point at the lower bound of the current frame
                // ------------------------------------------------------------------------
                // 1. Point is already on an exact frame,
                if (p.x === frameLower) {
                    newPoints.push({ x: p.x, y: p.y })

                    // 1.a. if several of the next points are also on the same X,
                    // we find the last one to draw a vertical line.
                    while (
                        (i + 1) < points.length
                        && points[i + 1].x === frameLower
                    ) {
                        i++
                    }
                    if (points[i].y !== newPoints[newPoints.length - 1].y) {
                        newPoints.push({ x: points[i].x, y: points[i].y })
                    }

                    // 1.b. if last point, we quit
                    if (i + 1 >= points.length) {
                        break
                    }

                    // 1.c. if next point is in a different frame we can move on to next iteration
                    if (frameUpper <= points[i + 1].x) {
                        i++
                        continue
                    }
                
                // 2. Point isn't on an exact frame
                // 2.a. There's a previous point, the we use it to interpolate the value.
                } else if (newPoints.length) {
                    newPoints.push({
                        x: frameLower,
                        y: interpolateLin(frameLower, points[i - 1], p),
                    })
                
                // 2.b. It's the very first point, then we don't change its value.
                } else {
                    newPoints.push({ x: frameLower, y: p.y })
                }

                // II. Placing interpolated point at the upper bound of the current frame
                // ---------------------------------------------------------------------------
                // First, we find the closest point from the frame upper bound (could be the same p).
                // Or could be a point that is exactly placed on frameUpper.
                while (
                    (i + 1) < points.length 
                    && (
                        Math.ceil(points[i + 1].x) === frameUpper
                        || Math.floor(points[i + 1].x) === frameUpper
                    )
                ) {
                    i++
                }
                p = points[i]

                // 1. If the next point is directly in the next frame, 
                // we do nothing, as this corresponds with next iteration frameLower.
                if (Math.floor(p.x) === frameUpper) {
                    continue
                
                // 2. If there's still a point after p, we use it to interpolate the value
                } else if (i < points.length - 1) {
                    newPoints.push({
                        x: frameUpper,
                        y: interpolateLin(frameUpper, p, points[i + 1]),
                    })

                // 3. If it's the last point, we dont change the value
                } else {
                    newPoints.push({ x: frameUpper, y: p.y })
                }

                i++
            }

            return newPoints
        }
function computeLineSegments(points) {
            const lineSegments = []
            let i = 0
            let p0
            let p1

            while(i < points.length - 1) {
                p0 = points[i]
                p1 = points[i + 1]
                lineSegments.push({
                    p0, p1, 
                    dy: computeSlope(p0, p1),
                    dx: 1,
                })
                i++
            }
            return lineSegments
        }
        


function NT_floatatom_setReceiveBusName(state, busName) {
            if (state.receiveBusName !== "empty") {
                msgBusUnsubscribe(state.receiveBusName, state.messageReceiver)
            }
            state.receiveBusName = busName
            if (state.receiveBusName !== "empty") {
                msgBusSubscribe(state.receiveBusName, state.messageReceiver)
            }
        }
function NT_floatatom_setSendReceiveFromMessage(state, m) {
            if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'receive'
            ) {
                NT_floatatom_setReceiveBusName(state, msg_readStringToken(m, 1))
                return true

            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'send'
            ) {
                state.sendBusName = msg_readStringToken(m, 1)
                return true
            }
            return false
        }
function NT_floatatom_defaultMessageHandler(m) {}
function NT_floatatom_receiveMessage(state, m) {
                    if (msg_isBang(m)) {
                        state.messageSender(state.value)
                        if (state.sendBusName !== "empty") {
                            msgBusPublish(state.sendBusName, state.value)
                        }
                        return
                    
                    } else if (
                        msg_getTokenType(m, 0) === MSG_STRING_TOKEN
                        && msg_readStringToken(m, 0) === 'set'
                    ) {
                        const setMessage = msg_slice(m, 1, msg_getLength(m))
                        if (msg_isMatching(setMessage, [MSG_FLOAT_TOKEN])) { 
                                state.value = setMessage    
                                return
                        }
        
                    } else if (NT_floatatom_setSendReceiveFromMessage(state, m) === true) {
                        return
                        
                    } else if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    
                        state.value = m
                        state.messageSender(state.value)
                        if (state.sendBusName !== "empty") {
                            msgBusPublish(state.sendBusName, state.value)
                        }
                        return
        
                    }
                }

const NT_line_t_defaultLine = {
                p0: {x: -1, y: 0},
                p1: {x: -1, y: 0},
                dx: 1,
                dy: 0,
            }
function NT_line_t_setNewLine(state, targetValue) {
                const startFrame = toFloat(FRAME)
                const endFrame = toFloat(FRAME) + state.nextDurationSamp
                if (endFrame === toFloat(FRAME)) {
                    state.currentLine = NT_line_t_defaultLine
                    state.currentValue = targetValue
                    state.nextDurationSamp = 0
                } else {
                    state.currentLine = {
                        p0: {
                            x: startFrame, 
                            y: state.currentValue,
                        }, 
                        p1: {
                            x: endFrame, 
                            y: targetValue,
                        }, 
                        dx: 1,
                        dy: 0,
                    }
                    state.currentLine.dy = computeSlope(state.currentLine.p0, state.currentLine.p1)
                    state.nextDurationSamp = 0
                }
            }
function NT_line_t_setNextDuration(state, durationMsec) {
                state.nextDurationSamp = computeUnitInSamples(SAMPLE_RATE, durationMsec, 'msec')
            }
function NT_line_t_stop(state) {
                state.currentLine.p1.x = -1
                state.currentLine.p1.y = state.currentValue
            }



function NT_osc_t_setStep(state, freq) {
                    state.step = (2 * Math.PI / SAMPLE_RATE) * freq
                }
function NT_osc_t_setPhase(state, phase) {
                    state.phase = phase % 1.0 * 2 * Math.PI
                }

function NT_vline_t_setNewLine(state, targetValue) {
                state.points = removePointsBeforeFrame(state.points, toFloat(FRAME))
                const startFrame = toFloat(FRAME) + state.nextDelaySamp
                const endFrame = startFrame + state.nextDurationSamp
                if (endFrame === toFloat(FRAME)) {
                    state.currentValue = targetValue
                    state.lineSegments = []
                } else {
                    state.points = insertNewLinePoints(
                        state.points, 
                        {x: startFrame, y: state.currentValue},
                        {x: endFrame, y: targetValue}
                    )
                    state.lineSegments = computeLineSegments(
                        computeFrameAjustedPoints(state.points))
                }
                state.nextDurationSamp = 0
                state.nextDelaySamp = 0
            }
function NT_vline_t_setNextDuration(state, durationMsec) {
                state.nextDurationSamp = computeUnitInSamples(SAMPLE_RATE, durationMsec, 'msec')
            }
function NT_vline_t_setNextDelay(state, delayMsec) {
                state.nextDelaySamp = computeUnitInSamples(SAMPLE_RATE, delayMsec, 'msec')
            }

function NT_div_setLeft(state, value) {
                    state.leftOp = value
                }
function NT_div_setRight(state, value) {
                    state.rightOp = value
                }

function NT_bang_setReceiveBusName(state, busName) {
            if (state.receiveBusName !== "empty") {
                msgBusUnsubscribe(state.receiveBusName, state.messageReceiver)
            }
            state.receiveBusName = busName
            if (state.receiveBusName !== "empty") {
                msgBusSubscribe(state.receiveBusName, state.messageReceiver)
            }
        }
function NT_bang_setSendReceiveFromMessage(state, m) {
            if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'receive'
            ) {
                NT_bang_setReceiveBusName(state, msg_readStringToken(m, 1))
                return true

            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'send'
            ) {
                state.sendBusName = msg_readStringToken(m, 1)
                return true
            }
            return false
        }
function NT_bang_defaultMessageHandler(m) {}
function NT_bang_receiveMessage(state, m) {
                if (NT_bang_setSendReceiveFromMessage(state, m) === true) {
                    return
                }
                
                const outMessage = msg_bang()
                state.messageSender(outMessage)
                if (state.sendBusName !== "empty") {
                    msgBusPublish(state.sendBusName, outMessage)
                }
                return
            }











        let F = 0
let FRAME = 0
let BLOCK_SIZE = 0
let SAMPLE_RATE = 0
let NULL_SIGNAL = 0
function SND_TO_NULL(m) {}
let EMPTY_MESSAGE = msg_create([])

        

        const N_n_0_1_state = {
                                value: msg_floats([0]),
receiveBusName: "empty",
sendBusName: "empty",
messageReceiver: NT_floatatom_defaultMessageHandler,
messageSender: NT_floatatom_defaultMessageHandler,
                            }
const N_m_n_0_4_0_sig_state = {
                                currentValue: 0,
                            }
const N_n_0_7_state = {
                                value: msg_floats([0]),
receiveBusName: "empty",
sendBusName: "empty",
messageReceiver: NT_floatatom_defaultMessageHandler,
messageSender: NT_floatatom_defaultMessageHandler,
                            }
const N_n_0_8_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_0_3_state = {
                                outTemplates: [],
outMessages: [],
messageTransferFunctions: [],
                            }
const N_n_0_2_state = {
                                currentLine: NT_line_t_defaultLine,
currentValue: 0,
nextDurationSamp: 0,
                            }
const N_n_0_9_state = {
                                value: msg_create([]),
receiveBusName: "empty",
sendBusName: "empty",
messageReceiver: NT_bang_defaultMessageHandler,
messageSender: NT_bang_defaultMessageHandler,
                            }
const N_n_0_6_state = {
                                outTemplates: [],
outMessages: [],
messageTransferFunctions: [],
                            }
const N_n_0_5_state = {
                                points: [],
lineSegments: [],
currentValue: 0,
nextDurationSamp: 0,
nextDelaySamp: 0,
                            }
const N_n_0_4_state = {
                                phase: 0,
step: 0,
                            }
        
function N_n_0_1_rcvs_0(m) {
                            
                NT_floatatom_receiveMessage(N_n_0_1_state, m)
                return
            
                            throw new Error('Node "n_0_1", inlet "0", unsupported message : ' + msg_display(m))
                        }

function N_m_n_0_4_0__routemsg_rcvs_0(m) {
                            
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                N_m_n_0_4_0__routemsg_snds_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                            throw new Error('Node "m_n_0_4_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                        }
let N_m_n_0_4_0_sig_outs_0 = 0
function N_m_n_0_4_0_sig_rcvs_0(m) {
                            
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            N_m_n_0_4_0_sig_state.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                            throw new Error('Node "m_n_0_4_0_sig", inlet "0", unsupported message : ' + msg_display(m))
                        }

function N_n_0_7_rcvs_0(m) {
                            
                NT_floatatom_receiveMessage(N_n_0_7_state, m)
                return
            
                            throw new Error('Node "n_0_7", inlet "0", unsupported message : ' + msg_display(m))
                        }

function N_n_0_8_rcvs_0(m) {
                            
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    NT_div_setLeft(N_n_0_8_state, msg_readFloatToken(m, 0))
                    N_n_0_3_rcvs_0(msg_floats([N_n_0_8_state.rightOp !== 0 ? N_n_0_8_state.leftOp / N_n_0_8_state.rightOp: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    N_n_0_3_rcvs_0(msg_floats([N_n_0_8_state.rightOp !== 0 ? N_n_0_8_state.leftOp / N_n_0_8_state.rightOp: 0]))
                    return
                }
            
                            throw new Error('Node "n_0_8", inlet "0", unsupported message : ' + msg_display(m))
                        }

function N_n_0_3_rcvs_0(m) {
                            
                if (
                    msg_isStringToken(m, 0) 
                    && msg_readStringToken(m, 0) === 'set'
                ) {
                    N_n_0_3_state.outTemplates = [[]]
                    for (let i = 1; i < msg_getLength(m); i++) {
                        if (msg_isFloatToken(m, i)) {
                            N_n_0_3_state.outTemplates[0].push(MSG_FLOAT_TOKEN)
                        } else {
                            N_n_0_3_state.outTemplates[0].push(MSG_STRING_TOKEN)
                            N_n_0_3_state.outTemplates[0].push(msg_readStringToken(m, i).length)
                        }
                    }
    
                    const message = msg_create(N_n_0_3_state.outTemplates[0])
                    for (let i = 1; i < msg_getLength(m); i++) {
                        if (msg_isFloatToken(m, i)) {
                            msg_writeFloatToken(
                                message, i - 1, msg_readFloatToken(m, i)
                            )
                        } else {
                            msg_writeStringToken(
                                message, i - 1, msg_readStringToken(m, i)
                            )
                        }
                    }
                    N_n_0_3_state.outMessages[0] = message
                    N_n_0_3_state.messageTransferFunctions.splice(0, N_n_0_3_state.messageTransferFunctions.length - 1)
                    N_n_0_3_state.messageTransferFunctions[0] = function (m) {
                        return N_n_0_3_state.outMessages[0]
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_3_state.messageTransferFunctions.length; i++) {
                        N_n_0_2_rcvs_0(N_n_0_3_state.messageTransferFunctions[i](m))
                    }
                    return
                }
            
                            throw new Error('Node "n_0_3", inlet "0", unsupported message : ' + msg_display(m))
                        }
let N_n_0_2_outs_0 = 0
function N_n_0_2_rcvs_0(m) {
                            
            if (
                msg_isMatching(m, [MSG_FLOAT_TOKEN])
                || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
            ) {
                switch (msg_getLength(m)) {
                    case 2:
                        NT_line_t_setNextDuration(N_n_0_2_state, msg_readFloatToken(m, 1))
                    case 1:
                        NT_line_t_setNewLine(N_n_0_2_state, msg_readFloatToken(m, 0))
                }
                return
    
            } else if (msg_isAction(m, 'stop')) {
                NT_line_t_stop(N_n_0_2_state)
                return
    
            }
        
                            throw new Error('Node "n_0_2", inlet "0", unsupported message : ' + msg_display(m))
                        }

function N_n_0_9_rcvs_0(m) {
                            
            NT_bang_receiveMessage(N_n_0_9_state, m)
            return
        
                            throw new Error('Node "n_0_9", inlet "0", unsupported message : ' + msg_display(m))
                        }

function N_n_0_6_rcvs_0(m) {
                            
                if (
                    msg_isStringToken(m, 0) 
                    && msg_readStringToken(m, 0) === 'set'
                ) {
                    N_n_0_6_state.outTemplates = [[]]
                    for (let i = 1; i < msg_getLength(m); i++) {
                        if (msg_isFloatToken(m, i)) {
                            N_n_0_6_state.outTemplates[0].push(MSG_FLOAT_TOKEN)
                        } else {
                            N_n_0_6_state.outTemplates[0].push(MSG_STRING_TOKEN)
                            N_n_0_6_state.outTemplates[0].push(msg_readStringToken(m, i).length)
                        }
                    }
    
                    const message = msg_create(N_n_0_6_state.outTemplates[0])
                    for (let i = 1; i < msg_getLength(m); i++) {
                        if (msg_isFloatToken(m, i)) {
                            msg_writeFloatToken(
                                message, i - 1, msg_readFloatToken(m, i)
                            )
                        } else {
                            msg_writeStringToken(
                                message, i - 1, msg_readStringToken(m, i)
                            )
                        }
                    }
                    N_n_0_6_state.outMessages[0] = message
                    N_n_0_6_state.messageTransferFunctions.splice(0, N_n_0_6_state.messageTransferFunctions.length - 1)
                    N_n_0_6_state.messageTransferFunctions[0] = function (m) {
                        return N_n_0_6_state.outMessages[0]
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_6_state.messageTransferFunctions.length; i++) {
                        N_n_0_5_rcvs_0(N_n_0_6_state.messageTransferFunctions[i](m))
                    }
                    return
                }
            
                            throw new Error('Node "n_0_6", inlet "0", unsupported message : ' + msg_display(m))
                        }
let N_n_0_5_outs_0 = 0
function N_n_0_5_rcvs_0(m) {
                            
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            switch (msg_getLength(m)) {
                case 3:
                    NT_vline_t_setNextDelay(N_n_0_5_state, msg_readFloatToken(m, 2))
                case 2:
                    NT_vline_t_setNextDuration(N_n_0_5_state, msg_readFloatToken(m, 1))
                case 1:
                    NT_vline_t_setNewLine(N_n_0_5_state, msg_readFloatToken(m, 0))
            }
            return
    
        } else if (msg_isAction(m, 'stop')) {
            N_n_0_5_state.points = []
            N_n_0_5_state.lineSegments = []
            return
        }
        
                            throw new Error('Node "n_0_5", inlet "0", unsupported message : ' + msg_display(m))
                        }










let N_n_0_4_outs_0 = 0



let N_n_0_0_outs_0 = 0



function N_m_n_0_4_0__routemsg_snds_0(m) {
                        N_m_n_0_4_0_sig_rcvs_0(m)
COLD_0(m)
                    }

        function COLD_0(m) {
                    N_m_n_0_4_0_sig_outs_0 = N_m_n_0_4_0_sig_state.currentValue
                    NT_osc_t_setStep(N_n_0_4_state, N_m_n_0_4_0_sig_outs_0)
                }
        function IORCV_n_0_1_0(m) {
                    N_n_0_1_rcvs_0(m)
                }
function IORCV_n_0_3_0(m) {
                    N_n_0_3_rcvs_0(m)
                }
function IORCV_n_0_6_0(m) {
                    N_n_0_6_rcvs_0(m)
                }
function IORCV_n_0_7_0(m) {
                    N_n_0_7_rcvs_0(m)
                }
function IORCV_n_0_9_0(m) {
                    N_n_0_9_rcvs_0(m)
                }
        

        const exports = {
            metadata: {"libVersion":"0.1.0","audioSettings":{"channelCount":{"in":2,"out":2},"bitDepth":64,"sampleRate":0,"blockSize":0},"compilation":{"io":{"messageReceivers":{"n_0_1":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"frequency","position":[53,93]}},"n_0_3":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[145,118]}},"n_0_6":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[224,135]}},"n_0_7":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"volume-sustian","position":[145,61]}},"n_0_9":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"trigger-note","position":[224,101]}}},"messageSenders":{}},"variableNamesIndex":{"io":{"messageReceivers":{"n_0_1":{"0":"IORCV_n_0_1_0"},"n_0_3":{"0":"IORCV_n_0_3_0"},"n_0_6":{"0":"IORCV_n_0_6_0"},"n_0_7":{"0":"IORCV_n_0_7_0"},"n_0_9":{"0":"IORCV_n_0_9_0"}},"messageSenders":{}}}}},
            initialize: (sampleRate, blockSize) => {
                exports.metadata.audioSettings.sampleRate = sampleRate
                exports.metadata.audioSettings.blockSize = blockSize
                SAMPLE_RATE = sampleRate
                BLOCK_SIZE = blockSize

                
            N_n_0_1_state.messageReceiver = function (m) {
                NT_floatatom_receiveMessage(N_n_0_1_state, m)
            }
            N_n_0_1_state.messageSender = N_m_n_0_4_0__routemsg_rcvs_0
            NT_floatatom_setReceiveBusName(N_n_0_1_state, "empty")
        



            N_n_0_7_state.messageReceiver = function (m) {
                NT_floatatom_receiveMessage(N_n_0_7_state, m)
            }
            N_n_0_7_state.messageSender = N_n_0_8_rcvs_0
            NT_floatatom_setReceiveBusName(N_n_0_7_state, "empty")
        

            NT_div_setLeft(N_n_0_8_state, 0)
            NT_div_setRight(N_n_0_8_state, 100)
        

            
            
            N_n_0_3_state.messageTransferFunctions = [
                function (inMessage) {
                        
            
            
            let stringMem = []
            N_n_0_3_state.outTemplates[0] = []
            
                N_n_0_3_state.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    N_n_0_3_state.outTemplates[0].push(stringMem[0].length)
                }
            

                N_n_0_3_state.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            N_n_0_3_state.outMessages[0] = msg_create(N_n_0_3_state.outTemplates[0])
            
                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(N_n_0_3_state.outMessages[0], 0, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(N_n_0_3_state.outMessages[0], 0, stringMem[0])
                }
            

                msg_writeFloatToken(N_n_0_3_state.outMessages[0], 1, 50)
            
        
                        return N_n_0_3_state.outMessages[0]
                    }
,
            ]
        


        N_n_0_9_state.messageReceiver = function (m) {
            NT_bang_receiveMessage(N_n_0_9_state, m)
        }
        N_n_0_9_state.messageSender = N_n_0_6_rcvs_0
        NT_bang_setReceiveBusName(N_n_0_9_state, "empty")

        
    

            
            
            
            
            N_n_0_6_state.outTemplates[0] = []
            
                N_n_0_6_state.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                N_n_0_6_state.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            N_n_0_6_state.outMessages[0] = msg_create(N_n_0_6_state.outTemplates[0])
            
                msg_writeFloatToken(N_n_0_6_state.outMessages[0], 0, 1)
            

                msg_writeFloatToken(N_n_0_6_state.outMessages[0], 1, 10)
            
        

            
            
            
            N_n_0_6_state.outTemplates[1] = []
            
                N_n_0_6_state.outTemplates[1].push(MSG_FLOAT_TOKEN)
            

                N_n_0_6_state.outTemplates[1].push(MSG_FLOAT_TOKEN)
            

                N_n_0_6_state.outTemplates[1].push(MSG_FLOAT_TOKEN)
            
            N_n_0_6_state.outMessages[1] = msg_create(N_n_0_6_state.outTemplates[1])
            
                msg_writeFloatToken(N_n_0_6_state.outMessages[1], 0, 0)
            

                msg_writeFloatToken(N_n_0_6_state.outMessages[1], 1, 600)
            

                msg_writeFloatToken(N_n_0_6_state.outMessages[1], 2, 50)
            
        
            
            N_n_0_6_state.messageTransferFunctions = [
                function (inMessage) {
                        
                        return N_n_0_6_state.outMessages[0]
                    }
,
function (inMessage) {
                        
                        return N_n_0_6_state.outMessages[1]
                    }
,
            ]
        







            NT_osc_t_setStep(N_n_0_4_state, 0)
        



                COLD_0(EMPTY_MESSAGE)
            },
            dspLoop: (INPUT, OUTPUT) => {
                
        for (F = 0; F < BLOCK_SIZE; F++) {
            _commons_emitFrame(FRAME)
            
                N_n_0_4_outs_0 = Math.cos(N_n_0_4_state.phase)
                N_n_0_4_state.phase += N_n_0_4_state.step
            

        N_n_0_2_outs_0 = N_n_0_2_state.currentValue
        if (toFloat(FRAME) < N_n_0_2_state.currentLine.p1.x) {
            N_n_0_2_state.currentValue += N_n_0_2_state.currentLine.dy
            if (toFloat(FRAME + 1) >= N_n_0_2_state.currentLine.p1.x) {
                N_n_0_2_state.currentValue = N_n_0_2_state.currentLine.p1.y
            }
        }
    

        if (N_n_0_5_state.lineSegments.length) {
            if (toFloat(FRAME) < N_n_0_5_state.lineSegments[0].p0.x) {

            // This should come first to handle vertical lines
            } else if (toFloat(FRAME) === N_n_0_5_state.lineSegments[0].p1.x) {
                N_n_0_5_state.currentValue = N_n_0_5_state.lineSegments[0].p1.y
                N_n_0_5_state.lineSegments.shift()

            } else if (toFloat(FRAME) === N_n_0_5_state.lineSegments[0].p0.x) {
                N_n_0_5_state.currentValue = N_n_0_5_state.lineSegments[0].p0.y

            } else if (toFloat(FRAME) < N_n_0_5_state.lineSegments[0].p1.x) {
                N_n_0_5_state.currentValue += N_n_0_5_state.lineSegments[0].dy

            }
        }
        N_n_0_5_outs_0 = N_n_0_5_state.currentValue
    
N_n_0_0_outs_0 = N_n_0_4_outs_0 * (N_n_0_2_outs_0 + N_n_0_5_outs_0)
OUTPUT[0][F] = N_n_0_0_outs_0
OUTPUT[1][F] = N_n_0_0_outs_0
            FRAME++
        }
    
            },
            io: {
                messageReceivers: {
                    n_0_1: {
                            "0": IORCV_n_0_1_0,
                        },
n_0_3: {
                            "0": IORCV_n_0_3_0,
                        },
n_0_6: {
                            "0": IORCV_n_0_6_0,
                        },
n_0_7: {
                            "0": IORCV_n_0_7_0,
                        },
n_0_9: {
                            "0": IORCV_n_0_9_0,
                        },
                },
                messageSenders: {
                    
                },
            }
        }

        

    