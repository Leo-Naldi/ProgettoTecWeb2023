function makeModDashboardModal(id, header_elements, body_elements, onShow = _.noop, onHide= _.noop) {
    
    if (!_.isArray(header_elements)) {
        header_elements = [header_elements];
    }

    if (!_.isArray(body_elements)) {
        body_elements = [body_elements];
    }
    
    let modal = $('<div>', {
        'class': 'modal modal-lg fade',
        id: id,
        tabindex: -1,
        'aria-hidden': true,
        role: 'dialog',
        'aria-labeledby': 'modal-title',
    })


    let dialog = $('<div>', {
        'class': 'modal-dialog',
        role: 'document'
    })

    modal.append(dialog)

    let modal_content = $('<div>', {
        'class': 'modal-content'
    });

    dialog.append(modal_content);

    modal_content.append($('<div>', {
        'class': 'modal-header',
    }).append(...header_elements))


    let modal_body = $('<div>', {
        'class': 'modal-body',
    })

    modal_content.append(modal_body);

    modal_body.append(...body_elements);

    modal.on('show.bs.modal', onShow);

    modal.on('hidden.bs.modal', onHide);

    return modal;
}