var log = require("utils").log;
var eventCenter = {}
eventCenter.events = {}

eventCenter.new = function (name, event, cb, nolog) {
	if( this.events[name] ){
		log( name + " eventCenter", "eventCenter:new Error: eventCenter addListener, listener already exists!")
		return
	}
	if( ! nolog ){
		//log("eventCenter:new: ", name, event, cb)
	}
	this.events[name] = {event:event, cb:cb}
}
eventCenter.getNums = function (){
	return Object.keys(this.events).length;
} 

eventCenter.delete = function(name){
	delete this.events[name];
}

eventCenter.dispatch = function(event, data, isLog) {
	if(isLog){
		log("eventCenter dispatch: ", event, data)
	}
	for(var k in this.events) {
		if(event === this.events[k].event) {
			if(isLog){
				log("eventCenter dispatch222: ", event, data)
			}
			this.events[k].cb(event, data);
		}
	}
}

module.exports = eventCenter;