class Service {
  static rejectResponse(error, code = 409) {
        return { error, code };
    }

  static successResponse(payload, code = 200) {
        return { payload, code };
    }
}

module.exports = Service;