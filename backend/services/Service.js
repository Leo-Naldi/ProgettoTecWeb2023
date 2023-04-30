class Service {
  static rejectResponse(error, code = 409) {
        return { error: error, status: code };
    }

  static successResponse(payload=null, code = 200) {
        return (payload) ? { payload: payload, status: code }: { status: code };
    }
}

module.exports = Service;