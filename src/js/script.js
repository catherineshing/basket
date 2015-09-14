var goToLists = function(listId) {
    var $list = $('#' + listId),
        $listsPage = $('.lists');

    // Hide specified list
    $list.addClass('hidden');

    // Show lists view
    $listsPage.removeClass('hidden');
};

var goToItems = function(listId) {
    var $list = $('#' + listId),
        $listsPage = $('.lists'),
        $users = $('#users-modal input:checked'),
        userNames = [],
        $sharedUsers = $('#' + listId + ' .shared .users'),
        $icons = $list.find('.icons');

    $users.each(function() {
        userNames.push($(this).val());
    });

    $sharedUsers.html(userNames.join(', '));

    // Hide lists view
    $listsPage.addClass('hidden');

    // Show specified list
    $list.removeClass('hidden');
};

var editTitle = function(listId) {
    var $panelTitle = $('#' + listId + ' .panel-title'),
        title = $panelTitle.text(),
        $icons = $('#' + listId + ' .icons'),
        $input,
        $checkmark;

    $icons.addClass('hidden');

    $panelTitle.replaceWith('\
        <div class="title input-group">\
            <input type="text" class="form-control">\
            <span class="btn input-group-addon" title="Save List">\
                <i class="glyphicon glyphicon-ok"></i>\
            </span>\
        </div>');

    $input = $('.title input');
    $input.val(title);
    $input.focus();

    // Save title
    $checkmark = $('.title .btn.input-group-addon');
    $checkmark.click(function() {
        title = $input.val();

        $panelTitle = $(this).closest('.title');
        $panelTitle.replaceWith('<h3 class="panel-title" title="Edit Title">' + title + '</h3>');

        $icons.removeClass('hidden');

        $('#' + listId + ' .panel-title').click(function() {
            editTitle(listId);
        });
    });
};

var editItem = function(selector) {
    var $list = $(selector).closest('ul'),
        name = $(selector).find('.name').text(),
        comment = $(selector).find('.comment.hidden-xs').text(),
        selectedUser = $(selector).find('.user').text(),
        $users = $('#users-modal input:checked'),
        userName,
        $allItems,
        $item,
        $itemName,
        $deleteButton,
        $saveButton,
        html;

    if ($(selector).hasClass('new')) {
        $(selector).append('<div class="col-xs-12"><hr/></div>');
        $(selector).removeClass('new');

        $list.append('\
            <li class="row item new">\
                <div class="col-xs-12 add text-muted">\
                    <i class="glyphicon glyphicon-plus"></i>Add Item\
                </div>\
            </li>');
    }

    html = '\
        <li class="row item edit">\
            <div class="col-xs-12">\
                <div class="form-group name">\
                    <label class="control-label">Name</label>\
                    <input type="text" class="form-control" value="' + name + '" placeholder="Name">\
                </div>\
                <div class="form-group comment-edit">\
                    <label class="control-label">Comment</label>\
                    <textarea class="form-control" placeholder="Comment">' + comment + '</textarea>\
                </div>\
            </div>\
            <div class="col-xs-8">\
                <div class="assigned-user">\
                    <label class="control-label">Assign to:</label>\
                    <div class="users">\
                        <span class="radio">\
                            <label class="text-muted"><input type="radio" name="assigned-user" value=""' + (selectedUser ? '' : 'checked') + '>None</label>\
                        </span>';

    $users.each(function() {
        userName = $(this).val();

        html += '\
            <span class="radio">\
                <label><input type="radio" name="assigned-user" value="' + userName + '" ' + (selectedUser === userName ? 'checked' : '') + '>' + userName + '</label>\
            </span>\
            ';
    });

    html += '</div>\
                </div>\
            </div>\
            <div class="col-xs-4 buttons text-right">\
                <span class="btn btn-danger delete" title="Delete Item"><i class="glyphicon glyphicon-remove"></i></span>\
                <span class="btn btn-success save" title="Save Item"><i class="glyphicon glyphicon-ok"></i></span>\
            </div>\
            <div class="col-xs-12"><hr/></div>\
        </li>';

    $(selector).replaceWith(html);

    $allItems = $('.items li.item');
    $allItems.unbind('click');
    $allItems.css('cursor', 'default');

    $item = $('.item.edit');
    $itemName = $item.find('.name input');
    $deleteButton = $item.find('.buttons .delete');
    $saveButton = $item.find('.buttons .save');

    $itemName.focus().val($itemName.val());

    // Delete item
    $deleteButton.click(function() {
        $item.remove();
        setupEditItem(selector);
    });

    // Save item
    $saveButton.click(function() {
        name = $itemName.val();
        comment = $item.find('textarea').val();
        selectedUser = $item.find('.users input:checked').val();

        if (!name) {
            $item.find('.name input').css('border-color', '#a94442');
            return;
        }

        $item.replaceWith('\
            <li class="row item">\
                <div class="col-xs-10">\
                    <input type="checkbox" title="Mark Completed">\
                    <span class="name" title="Edit Item">' + name + '</span>\
                    <span class="comment text-muted hidden-xs">' + comment + '</span>\
                </div>\
                <div class="col-xs-2 user text-right">' + (selectedUser ? selectedUser : '') + '</div>\
                <div class="col-xs-12 comment text-muted visible-xs">' + comment + '</div>\
                <div class="col-xs-12"><hr/></div>\
            </li>');

        setupEditItem(selector);
    });
};

var setupEditItem = function(selector) {
    $('.items li.item').css('cursor', 'pointer');
    $('.items li.item').click(function(e) {
        if ('input' === e.target.tagName.toLowerCase()) {
            return;
        }
        editItem(this);
    });

    $('.item input[type="checkbox"]').change(function(e) {
        var $item = $(this).closest('li.item'),
            $children = $item.children('div');

        $children.css('text-decoration', this.checked ? 'line-through' : 'none');
    });
};


$(document).ready(function() {

    // Go to lists
    $('.items .back').click(function() {
        var listId = $(this).attr('data-list-id');
        goToLists(listId);
    });

    // Go to items
    $('a.list-group-item').click(function() {
        var $selector = $(this),
            listId = $selector.attr('data-list-id');

        goToItems(listId);
    });

    // Add list
    $('.lists .add').click(function() {
        var $lists = $('.lists .list-group'),
            $newList,
            $main,
            listName,
            listId;

        $lists.append('\
            <div class="list-group-item">\
                <div class="input-group">\
                    <input type="text" class="form-control">\
                    <span class="btn input-group-addon" title="Save List">\
                        <i class="glyphicon glyphicon-ok"></i>\
                    </span>\
                </div>\
            </div>');

        $newList = $('.lists .list-group-item input');
        $newList.focus();

        $newList.next('.btn').click(function() {
            listName = $newList.val();
            if (listName) {
                $main = $('.main');
                listId = listName.toLowerCase().replace(/\s+/g, '-');

                // Add clickable list item
                $lists.append('\
                    <a href="#' + listId + '" target="_self" class="list-group-item" data-list-id="' + listId + '">\
                        <span class="title">' + listName + '</span>\
                        <i class="glyphicon glyphicon-chevron-right pull-right"></i>\
                    </a>');

                // Create new list
                $main.append('\
                    <div id="' + listId + '" class="items hidden">\
                        <div class="header">\
                            <span class="back" data-list-id="' + listId + '"><i class="glyphicon glyphicon-chevron-left"></i>Back</span>\
                            <span class="alert alert-success hidden"></span>\
                        </div>\
                        <div class="panel panel-default">\
                            <div class="panel-heading">\
                                <h3 class="panel-title" title="Edit Title">' + listName + '</h3>\
                                <div class="icons pull-right">\
                                    <span class="btn btn-default users" data-toggle="modal" data-target="#users-modal" title="Add Users"><i class="glyphicon glyphicon-user"></i></span>\
                                    <span class="btn btn-default email" data-toggle="modal" data-target="#email-modal" title="Email List"><i class="glyphicon glyphicon-envelope"></i></span>\
                                    <span class="btn btn-danger delete" data-list-id="whole-foods" title="Delete List"><i class="glyphicon glyphicon-trash"></i></span>\
                                </div>\
                                <div class="shared text-muted">\
                                    <span>Shared with: </span>\
                                    <span class="users"></span>\
                                </div>\
                            </div>\
                            <div class="panel-body">\
                                <ul class="list-unstyled">\
                                    <li class="row item new">\
                                        <div class="col-xs-12 add text-muted">\
                                            <i class="glyphicon glyphicon-plus"></i>Add Item\
                                        </div>\
                                    </li>\
                                </ul>\
                            </div>\
                        </div>\
                    </div>');

                // Bind event handlers
                $('a[data-list-id="' + listId + '"]').click(function() {
                    goToItems(listId);
                });

                setupEditItem($('#' + listId));

                $('#' + listId + ' .back').click(function() {
                    goToLists(listId);
                });

                $('#' + listId + ' .icons .delete').click(function() {
                    $('a[data-list-id="' + listId + '"]').remove();
                    goToLists(listId);
                });

                $('#' + listId + ' .panel-title').click(function() {
                    editTitle(listId);
                });
            }

            // Remove input item
            $('.lists div.list-group-item').remove();
        });
    });

    // Save users
    $('#users-modal .btn-primary').click(function() {
        var $modal = $('#users-modal'),
            $users = $modal.find('input:checked'),
            $alert = $('.items .alert'),
            $sharedUsers = $('.items .shared .users'),
            userNames = [];

        $users.each(function() {
            userNames.push($(this).val());
        });

        $sharedUsers.html(userNames.join(', '));

        // Dismiss modal
        $modal.modal('hide');

        // Show success message
        $alert.removeClass('hidden');
        $alert.html('Users saved');
        setTimeout(function() {
            $alert.addClass('hidden');
        }, 7000);
    });

    // Email list
    $('#email-modal .btn-primary').click(function() {
        var $modal = $('#email-modal'),
            $alert = $('.items .alert'),
            $input = $modal.find('input'),
            email = $input.val();

        // Dismiss modal
        $modal.modal('hide');

        // Show success message
        if (email) {
            $alert.removeClass('hidden');
            $alert.html('Email sent');
            setTimeout(function() {
                $alert.addClass('hidden');
            }, 7000);
        }
    });

    // Reset email
    $('#email-modal').on('hide.bs.modal', function() {
        $('#email-modal input').val('');
    });

    // Delete list
    $('.items .icons .delete').click(function() {
        var listId = $(this).attr('data-list-id'),
            $alert = $('.lists .alert');

        $('a[data-list-id="' + listId + '"]').remove();
        goToLists(listId);

        $alert.removeClass('hidden');
        $alert.html('List deleted');
        setTimeout(function() {
            $alert.addClass('hidden');
        }, 7000);
    });

    // Edit list title
    $('.items .panel-title').click(function() {
        var listId = $(this).closest('.items').attr('id');
        editTitle(listId);
    });

    // Strikethrough completed items
    $('.item input[type="checkbox"]').change(function(e) {
        var $item = $(this).closest('li.item'),
            $children = $item.children('div');

        $children.css('text-decoration', this.checked ? 'line-through' : 'none');
    });

    // Edit item
    $('.items li.item').click(function(e) {
        if ('input' === e.target.tagName.toLowerCase()) {
            return;
        }
        editItem(this);
    });

});
