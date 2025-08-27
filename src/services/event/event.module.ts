import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    imports: [
        EventEmitterModule.forRoot({
            wildcard: false,          // use wildcard event names (false = strict mode)
            delimiter: '.',           // delimiter for event namespaces
            newListener: false,       // emit event when a new listener is added
            removeListener: false,    // emit event when a listener is removed
            maxListeners: 10,         // maximum number of listeners per event
            verboseMemoryLeak: false, // show event name when memory leak warning occurs
            ignoreErrors: false,      // if true, suppress errors for unhandled events
        }),
    ],
    exports: [EventEmitterModule], // export so it can be used in other modules
})
export class EventsModule { }
