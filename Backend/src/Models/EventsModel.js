// Local Imports:
import Model from '../Core/Model.js';

class EventsModel extends Model {
    constructor() {
        super('events');
    }
}

const eventsModel = new EventsModel();
export default eventsModel;
