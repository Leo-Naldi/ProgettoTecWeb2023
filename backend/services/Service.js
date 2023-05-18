const config = require("../config");

class Service {
  static rejectResponse(error, code = config.default_client_error) {
        return { error: error, status: code };
    }

  static successResponse(payload=null, code = config.default_success_code) {
        return (payload) ? { payload: payload, status: code }: { status: code };
    }
}

module.exports = Service;