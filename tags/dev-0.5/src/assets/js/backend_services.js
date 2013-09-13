/**
 * This namespace handles the js functionality of the backend services page.
 * 
 * @namespace BackendServices
 */
var BackendServices = {
    /**
     * Contains the basic record methods for the page.
     * 
     * @type ServicesHelper|CategoriesHelper
     */
    helper: {},
    
    /**
     * Default initialize method of the page.
     * 
     * @param {bool} bindEventHandlers (OPTIONAL) Determines whether to bind the 
     * default event handlers (default: true).
     */
    initialize: function(bindEventHandlers) {
        if (bindEventHandlers === undefined) bindEventHandlers = true;
        
        // Fill available service categories listbox.
        $.each(GlobalVariables.categories, function(index, category) {
            var option = new Option(category.name, category.id);
            $('#service-category').append(option);
        });
        $('#service-category').append(new Option('- No Category -', null)).val('null');
        
        // Instantiate helper object (service helper by default).
        BackendServices.helper = new ServicesHelper();
        BackendServices.helper.resetForm();
        BackendServices.helper.filter('');
        
        $('#service-duration').spinner({
            'min': 0,
            'disabled': true //default
        });
        
        
        if (bindEventHandlers) BackendServices.bindEventHandlers();        
    },
        
    /**
     * Binds the default event handlers of the backend services page. Do not use this method
     * if you include the "BackendServices" namespace on another page.
     */
    bindEventHandlers: function() {
        /**
         * Event: Page Tab Button "Click"
         * 
         * Changes the displayed tab.
         */
        $('.tab').click(function() {
            $('.active').removeClass('active');
            $(this).addClass('active');
            $('.tab-content').hide();
            
            if ($(this).hasClass('services-tab')) { // display services tab
                $('#services').show();
                BackendServices.helper = new ServicesHelper();
            } else if ($(this).hasClass('categories-tab')) { // display categories tab
                $('#categories').show();
                BackendServices.helper = new CategoriesHelper();
            }
            
            BackendServices.helper.resetForm();
            BackendServices.helper.filter('');
            $('.filter-key').val('');
        });
        
        /**
         * Event: Filter Services Button "Click"
         */
        $('.filter-services').click(function() {
            var key = $('#services .filter-key').val();
            $('.selected-row').removeClass('selected-row');
            BackendServices.helper.resetForm();
            BackendServices.helper.filter(key);
        });
        
        /**
         * Event: Filter Categories Button "Click"
         */
        $('.filter-categories').click(function() {
            var key = $('#categories .filter-key').val();
            $('.selected-row').removeClass('selected-row');
            BackendServices.helper.resetForm();
            BackendServices.helper.filter(key);
        });
        
        /**
         * Event: Filter Service Row "Click"
         * 
         * Display the selected service data to the user.
         */
        $(document).on('click', '.service-row', function() {
            if ($('#services .filter-services').prop('disabled')) {
                $('#services .filter-results').css('color', '#AAA');
                return; // exit because we are on edit mode
            }
            
            var service = { 'id': $(this).attr('data-id') };
            $.each(BackendServices.helper.filterResults, function(index, item) {
                if (item.id === service.id) {
                    service = item;
                    return;
                }
            });
            BackendServices.helper.display(service);
            $('.selected-row').removeClass('selected-row');
            $(this).addClass('selected-row');
            $('#edit-service, #delete-service').prop('disabled', false);
        });
        
        /**
         * Event: Filter Categories Row "Click"
         * 
         * Displays the selected row data on the right side of the page.
         */
        $(document).on('click', '.category-row', function() {
            if ($('#categories .filter-categories').prop('disabled')) {
                $('#categories .filter-results').css('color', '#AAA');
                return; // exit because we are on edit mode
            }
            var category = { 'id': $(this).attr('data-id') };
            $.each(BackendServices.helper.filterResults, function(index, item) {
                if (item.id === category.id) {
                    category = item;
                    return;
                }
            });
            BackendServices.helper.display(category);
            $('.selected-row').removeClass('selected-row');
            $(this).addClass('selected-row');
            $('#edit-category, #delete-category').prop('disabled', false);
        });
        
        /**
         * Event: Add New Service Button "Click"
         */
        $('#add-service').click(function() {
            BackendServices.helper.resetForm();
            $('#services .add-edit-delete-group').hide();
            $('#services .save-cancel-group').show();
            $('#services .details').find('input, textarea').prop('readonly', false);
            $('#services .details').find('select').prop('disabled', false);
            $('#service-duration').spinner('enable');
            $('#services .filter-services').prop('disabled', true);
            $('#services .filter-results').css('color', '#AAA');
        });
        
        /**
         * Event: Add Category Button "Click"
         */
        $('#add-category').click(function() {
            BackendServices.helper.resetForm();
            $('#categories .add-edit-delete-group').hide();
            $('#categories .save-cancel-group').show();
            $('#categories .details').find('input, textarea').prop('readonly', false);
            $('#categories .filter-categories').prop('disabled', true);
            $('#categories .filter-results').css('color', '#AAA');
        });
        
        /**
         * Event: Cancel Service Button "Click"
         * 
         * Cancel add or edit of a service record.
         */
        $('#cancel-service').click(function() {
            BackendServices.helper.resetForm();
        });
        
        /**
         * Event: Cancel Category Button "Click"
         */
        $('#cancel-category').click(function() {
            BackendServices.helper.resetForm();
        });
        
        /**
         * Event: Save Service Button "Click"
         */
        $('#save-service').click(function() {
            var service = {
                'name': $('#service-name').val(),
                'duration': $('#service-duration').val(),
                'price': $('#service-price').val(),
                'currency': $('#service-currency').val(),
                'description': $('#service-description').val()
            };
            
            if ($('#service-category').val() !== 'null') {
                service.id_service_categories = $('#service-category').val();
            } else {
                service.id_service_categories = null;
            }
            
            if ($('#service-id').val() !== '') {
                service.id = $('#service-id').val();
            }
            
            if (!BackendServices.helper.validate(service)) return;
            
            BackendServices.helper.save(service);
        });
        
        /**
         * Event: Categories Save Button "Click"
         */
        $('#save-category').click(function() {
            var category = {
                'name': $('#category-name').val(),
                'description': $('#category-description').val()
            };
            
            if ($('#category-id').val() !== '') {
                category.id = $('#category-id').val();
            }
            
            if (!BackendServices.helper.validate(category)) return;
            
            BackendServices.helper.save(category);
        });
        
        /**
         * Event: Edit Service Button "Click"
         */
        $('#edit-service').click(function() {
            $('#services .add-edit-delete-group').hide();
            $('#services .save-cancel-group').show();
            $('.filter-services').prop('disabled', true);
            $('#services .filter-results').css('color', '#AAA');
            $('#services .details').find('input, textarea').prop('readonly', false);
            $('#services .details select').prop('disabled', false);
            $('#service-duration').spinner('enable');
        });
        
        /**
         * Event: Edit Category Button "Click"
         */
        $('#edit-category').click(function() {
            $('#categories .add-edit-delete-group').hide();
            $('#categories .save-cancel-group').show();
            $('.filter-categories').prop('disabled', true);
            $('#categories .filter-results').css('color', '#AAA');
            $('#categories .details').find('input, textarea').prop('readonly', false);
        });
        
        /**
         * Event: Delete Service Button "Click"
         */
        $('#delete-service').click(function() {
            var serviceId = $('#service-id').val();
            
            var messageBtns = {
                'Delete': function() {
                    BackendServices.helper.delete(serviceId);
                    $('#message_box').dialog('close');
                },
                'Cancel': function() {
                    $('#message_box').dialog('close');
                }
            };
            
            GeneralFunctions.displayMessageBox('Delete Service', 'Are you sure that you want '
                    + 'to delete this record? This action cannot be undone.', messageBtns);
        });
        
        $('#delete-category').click(function() {
            var categoryId = $('#category-id').val();
            
            var messageBtns = {
                'Delete': function() {
                    BackendServices.helper.delete(categoryId);
                    $('#message_box').dialog('close');
                },
                'Cancel': function() {
                    $('#message_box').dialog('close');
                }
            };
            
            GeneralFunctions.displayMessageBox('Delete Category', 'Are you sure that you want '
                    + 'to delete this record? This action cannot be undone.', messageBtns);
        });
    },
    
    /**
     * Update the service category listbox. Use this method every time a change is made
     * to the service categories db table.
     * 
     * @param {array} categories Contains the available category objects.
     */
    updateAvailableCategories: function() {
        var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_filter_service_categories';
        var postData = { 'key': '' };
        
        $.post(postUrl, postData, function(response) {
            ///////////////////////////////////////////////////////////////
            console.log('Update Available Categories Response:', response);
            ///////////////////////////////////////////////////////////////
            
            if (!Backend.handleAjaxExceptions(response)) return;
            
            GlobalVariables.categories = response;
            var $select = $('#service-category');
            $select.empty();
            $.each(response, function(index, category) {
                var option = new Option(category.name, category.id);
                $select.append(option);
            });
            $select.append(new Option('- No Category -', null)).val('null');
        }, 'json');
    }
};

/**
 * This class contains the methods that will be used by the "Services" tab of the page.
 * @class ServicesHelper
 */
var ServicesHelper = function() {
    this.filterResults = {};
};

/**
 * Save service record to database.
 * 
 * @param {object} service Contains the service record data. If an 'id' value is provided
 * then the update operation is going to be executed.
 */
ServicesHelper.prototype.save = function(service) {
    var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_save_service';
    var postData = { 'service': JSON.stringify(service) };
    
    $.post(postUrl, postData, function(response) {
        console.log('Save Service Response:', response);
        if (!Backend.handleAjaxExceptions(response)) return;
        
        Backend.displayNotification('Service saved successfully!');
        BackendServices.helper.resetForm();
        BackendServices.helper.filter($('#services .filter-key').val());
    }, 'json');
};

/**
 * Delete a service records from database.
 * 
 * @param {int} id Record id to be deleted. 
 */
ServicesHelper.prototype.delete = function(id) {
    var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_delete_service';
    var postData = { 'service_id': id };
    
    $.post(postUrl, postData, function(response) {
        ////////////////////////////////////////////////////
        console.log('Delete service response:', response);
        ////////////////////////////////////////////////////
        
        if (!Backend.handleAjaxExceptions(response)) return;
        
        Backend.displayNotification('Service deleted successfully!');
        
        BackendServices.helper.resetForm();
        BackendServices.helper.filter($('#services .filter-key').val());
    });
};

/**
 * Validates a service record.
 * 
 * @param {object} service Contains the service data.
 * @returns {bool} Returns the validation result.
 */
ServicesHelper.prototype.validate = function(service) {
    $('#services .required').css('border', '');
    
    try {
        // validate required fields.
        var missingRequired = false;
        $('#services .required').each(function() {
            if ($(this).val() == '' || $(this).val() == undefined) {
                $(this).css('border', '2px solid red');
                missingRequired = true;
            }
        });
        if (missingRequired) {
            throw 'Fields with * are  required.';
        }
        
        return true;
    } catch(exc) {
        return false;
    }
};

/**
 * Resets the service tab form back to its initial state. 
 */
ServicesHelper.prototype.resetForm = function() {
    $('#services .details').find('input, textarea').val('');
    $('#service-category').val('null');
    $('#services .add-edit-delete-group').show();
    $('#services .save-cancel-group').hide();
    $('#edit-service, #delete-service').prop('disabled', true);
    $('#services .details').find('input, textarea').prop('readonly', true);
    $('#service-category').prop('disabled', true);
    $('.filter-services').prop('disabled', false);
    $('#services .filter-results').css('color', '');
};

/**
 * Display a service record into the service form.
 * 
 * @param {object} service Contains the service record data.
 */
ServicesHelper.prototype.display = function(service) {
    $('#service-id').val(service.id);
    $('#service-name').val(service.name);
    $('#service-duration').val(service.duration);
    $('#service-price').val(service.price);
    $('#service-currency').val(service.currency);
    $('#service-description').val(service.description);
    
    var categoryId = (service.id_service_categories != null) ? service.id_service_categories : 'null';
    $('#service-category').val(categoryId);
};

/**
 * Filters service records depending a string key.
 * 
 * @param {string} key This is used to filter the service records of the database.
 */
ServicesHelper.prototype.filter = function(key) {
    var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_filter_services';
    var postData = { 'key': key };
    
    $.post(postUrl, postData, function(response) {
        /////////////////////////////////////////////////////
        console.log('Filter services response:', response);
        /////////////////////////////////////////////////////
        
        if (!Backend.handleAjaxExceptions(response)) return;

        BackendServices.helper.filterResults = response;
        $('#services .filter-results').html('');
        
        $.each(response, function(index, service) {
            var html = ServicesHelper.prototype.getFilterHtml(service);
            $('#services .filter-results').append(html);
        });
    }, 'json');
};

/**
 * Get a service row html code that is going to be displayed on the filter results list.
 * 
 * @param {object} service Contains the service record data.
 * @returns {string} The html code that represents the record on the filter results list.
 */
ServicesHelper.prototype.getFilterHtml = function(service) {
    var html =
            '<div class="service-row" data-id="' + service.id + '">' + 
                '<strong>' + service.name + '</strong><br>' +
                service.duration + ' min - ' + 
                service.price + ' ' + service.currency + '<br>' +
            '</div>';

    return html;
};

/**
 * This class contains the core method implementations that belong to the categories tab
 * of the backend services page.
 * 
 * @class CategoriesHelper
 */
var CategoriesHelper = function() {
    this.filterResults = {};
};

/**
 * Filter service categories records.
 * 
 * @param {string} key This key string is used to filter the category records.
 */
CategoriesHelper.prototype.filter = function(key) {
    var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_filter_service_categories';
    var postData = { 'key': key };
    
    $.post(postUrl, postData, function(response) {
        ///////////////////////////////////////////////////////
        console.log('Filter Categories Response:', response);
        ///////////////////////////////////////////////////////
        
        if (!Backend.handleAjaxExceptions(response)) return;
        
        BackendServices.helper.filterResults = response;
        $('#categories .filter-results').html('');
        $.each(response, function(index, category) {
           var html = BackendServices.helper.getFilterHtml(category);
           $('#categories .filter-results').append(html);
        });
        
    }, 'json');
};

/**
 * Save a category record to the database (via ajax post).
 * 
 * @param {object} category Contains the category data.
 */
CategoriesHelper.prototype.save = function(category) {
    var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_save_service_category';
    var postData = { 'category': JSON.stringify(category) };
    
    $.post(postUrl, postData, function(response) {
        ///////////////////////////////////////////////////////////
        console.log('Save Service Category Response:', response);
        ///////////////////////////////////////////////////////////
        
        if (!Backend.handleAjaxExceptions(response)) return;
        
        Backend.displayNotification('Service saved successfully!');
        BackendServices.helper.resetForm();
        BackendServices.helper.filter($('#categories .filter-key').val());
        BackendServices.updateAvailableCategories();
    });
};

/**
 * Delete category record.
 * 
 * @param {int} id Record id to be deleted.
 */
CategoriesHelper.prototype.delete = function(id) {
    var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_delete_service_category';
    var postData = { 'category_id': id };
    
    $.post(postUrl, postData, function(response) {
        ////////////////////////////////////////////////////
        console.log('Delete category response:', response);
        ////////////////////////////////////////////////////
        
        if (!Backend.handleAjaxExceptions(response)) return;
        
        Backend.displayNotification('Category deleted successfully!');
        
        BackendServices.helper.resetForm();
        BackendServices.helper.filter($('#categories .filter-key').val());
        BackendServices.updateAvailableCategories();
    });
};

/**
 * Display a category record on the form.
 * 
 * @param {object} category Contains the category data.
 */
CategoriesHelper.prototype.display = function(category) {
    $('#category-id').val(category.id);
    $('#category-name').val(category.name);
    $('#category-description').val(category.description);
};

/**
 * Validate category data before save (insert or update).
 * 
 * @param {object} category Contains the category data.
 */
CategoriesHelper.prototype.validate = function(category) {
    $('#categories .details').find('input, textarea').css('border', '');
    
    try {
        var missingRequired = false;
        $('#categories .required').each(function() {
            if ($(this).val() == '' || $(this).val() == undefined) {
                $(this).css('border', '2px solid red');
                missingRequired = true;
            }
        });
        if (missingRequired) throw 'Required field is missing.';
        
        return true;
        
    } catch(exc) {
        console.log('Category Record Validation Exc:', exc);
        return false;
    }
};

/**
 * Bring the category form back to its initial state.
 */
CategoriesHelper.prototype.resetForm = function() {
    $('#categories .add-edit-delete-group').show();
    $('#categories .save-cancel-group').hide();
    $('#categories .details').find('input, textarea').val('');
    $('#categories .details').find('input, textarea').prop('readonly', true);
    $('#edit-category, #delete-category').prop('disabled', true);
    $('#categories .filter-results').css('color', '');
    $('#categories .filter-categories').prop('disabled', false);
};

/**
 * Get the filter results row html code.
 * 
 * @param {object} category Contains the category data.
 * @return {string} Returns the record html code.
 */
CategoriesHelper.prototype.getFilterHtml = function(category) {    
    var html =
            '<div class="category-row" data-id="' + category.id + '">' + 
                '<strong>' + category.name + '</strong>' +
            '</div>';

    return html;
};

