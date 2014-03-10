(function() {

$(document).ajaxStart(function() {
    $('.loader-fixed.loader').show();
    $('input, button, select').attr('disabled', true);
});
$(document).ajaxStop(function() {
    $('.loader-fixed.loader').hide();
    $('.loader').removeClass('loader');
    $('input, button, select').attr('disabled', false);
});
$('.panel').on('loader', function(event, element) {
    var panel = $(event.target);
    panel.find('.loader-fixed').addClass('loader');
    if (element) {
        $(element).addClass('loader');
    }
});
$('.panel').on('panel_get', function(event, data) {
    var panel = $(event.target);
    var panel_id = panel.attr('id');
    var storage = stored_data();
    var url = data && data.url;
    var hash = [panel_id, url].join('');
    if (hash == window.location.hash) {
        return;
    }
    if (url) {
        window.location.hash = hash;
        storage.url = url;
        storage.uids = []; // Reset picked uids
        stored_data(true);
    } else {
        url = storage.url;
    }
    url = url ? url : panel.data('box');
    panel.find('.labels [value="' + url + '"]').attr('selected', true);

    function stored_data(save) {
        if (!save) {
            value = localStorage[panel_id];
            value = value ? JSON.parse(value) : ({url: null, uids: []});
        } else {
            localStorage[panel_id] = JSON.stringify(storage);
            value = storage;
        }
        return value;
    }
    function get_label() {
        return panel.find('select.labels :checked').data('id');
    }
    function mark(name, ids) {
        var url = '/mark/' + [get_label(), name].join('/') + '/';
        $.post(url, {ids: ids}).done(refresh);
    }
    function refresh() {
        panel.trigger('refresh');
    }

    panel.trigger('loader');
    $.get(url, function(content) {
        // Set content
        panel.find('.panel-body').html(content);

        panel.find('.email-line .email-subject').click(function() {
            if (!$(this).parents('.thread').length) {
                panel.trigger('panel_get', {url: $(this).data('thread')});
            }
            return false;
        });

        panel.find('.email-pick input')
            .each(function() {
                var uid = $(this).val();
                if (storage.uids.indexOf(uid) > -1) {
                    $(this).attr('checked', true);
                } else if ($(this).is(':checked')) {
                    storage.uids.push(uid);
                    stored_data(true);
                }
            })
            .on('change', function() {
                var uid = $(this).val();
                if ($(this).is(':checked') && storage.uids.indexOf(uid) == -1) {
                    storage.uids.push(uid);
                } else {
                    index = storage.uids.indexOf(uid);
                    storage.uids.splice(index, 1);
                }
                stored_data(true);
                panel.trigger('refresh_picks');
            });
        panel.on('refresh_picks', function() {
            var more = panel.find('.more');
            var buttons = panel.find('[name="copy_to_inbox"], [value="archived"]');
            var checked = panel.find('.email-pick input:checked').parents('.email');

            buttons.hide();
            if (checked.length > 0) {
                buttons.show();
            }

            more.find('li').removeClass('_show');
            more.css({visibility: 'hidden'});
            if (checked.filter('.email-unread').length > 0) {
                more.find('[value="read"]').parents('li').addClass('_show');
            }
            if (checked.not('.email-unread').length > 0) {
                more.find('[value="unread"]').parents('li').addClass('_show');
            }
            if (checked.find('.email-star:not(.email-starred)').length > 0) {
                more.find('[value="starred"]').parents('li').addClass('_show');
            }
            if (checked.find('.email-starred').length > 0) {
                more.find('[value="unstarred"]').parents('li').addClass('_show');
            }
            if (more.find('li._show').length > 0) {
                more.css({visibility: 'visible'});
            }
        }).trigger('refresh_picks');

        panel.find('.email-star').click(function() {
            panel.trigger('loader');
            var $this = $(this);
            var name = $this.hasClass('email-starred') ? 'unstarred': 'starred';
            mark(name, [$this.parents('.email').data('id')]);
        });

        panel.find('.email-labels a').click(function() {
            panel.trigger('panel_get', {url: $(this).attr('href')});
            return false;
        });

        if (panel.find('.thread').length) {
            panel.find('.email-subject').click(function() {
                $(this).parents('.email').toggleClass('email-showed');
            });
            panel.find('.email-group-show').click(function() {
                $(this).hide().next('.email-group').show();
            });

            panel.find('.email-quote-switch').click(function() {
                $(this).next('.email-quote').toggle();
            });
        }

        panel.find('button[name="mark"]').click(function() {
            panel.trigger('loader', this);
            var $this = $(this);
            mark($this.val(), storage.uids);
            return false;
        });
        panel.find('button[name="copy_to_inbox"]').click(function() {
            panel.trigger('loader', this);
            var url = '/copy/' + get_label() + '/' + CONF.inbox_id + '/';
            $.post(url, {ids: storage.uids}).done(refresh);
            return false;
        });
        panel.find('button[name="sync"]').click(function() {
            panel.trigger('loader', this);
            $.get('/sync/' + get_label() + '/').done(refresh);
            return false;
        });
        panel.find('button[name="sync_all"]').click(function() {
            panel.trigger('loader', this);
            $.get('/sync/').done(refresh);
            return false;
        });
    });
});
$('.panel')
    .on('refresh', function(event) {
        var panel = $(event.target);

        panel.trigger('loader');
        $.get('/labels/', function(content) {
            panel.find('.panel-head')
                .html(content)
                .find('.labels').on('change', function() {
                    panel.trigger('panel_get', {url: $(this).find(':selected').val()});
                });
            panel.trigger('panel_get');
        });
    })
    .each(function() {
        $(this).trigger('refresh');
    });
$(window).on('hashchange', function() {
    var parts = window.location.hash.split('/');
    var panel = $(parts.shift());
    if (panel.length) {
        panel.trigger('panel_get', {url: '/' + parts.join('/')});
    }
});

// END
})();
