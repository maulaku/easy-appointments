/**
 * Backend Customers javasript namespace. Contains the main functionality 
 * of the backend customers page. If you need to use this namespace in a 
 * different page, do not bind the default event handlers during initialization.
 *
 * @namespace BackendCustomers
 */
var BackendCustomers = {
    filterResults: {},
    selectedCustomer: {},
    selectedAppointment: {},
    
	/**
	 * This method initializes the backend customers page. If you use this namespace
	 * in a different page do not use this method. 
	 * 
	 * @param {bool} bindDefaultEventHandlers Whether to bind the default event handlers
	 * or not.  
	 */
	initialize: function(bindDefaultEventHandlers) {
		if (bindDefaultEventHandlers === undefined) {
			bindDefaultEventHandlers = false; // default value
		}
        
		BackendCustomers.filterCustomers('');
        $('#details').find('input, textarea').prop('readonly', true);
        
		if (bindDefaultEventHandlers) {
			BackendCustomers.bindEventHandlers();
		}
	},
    
    /**
     * Default event handlers declaration for backend customers page.
     */
	bindEventHandlers: function() {
        /**
         * Event: Customer Row "Click"
         * 
         * Display the customer data of the selected row.
         */
        $(document).on('click', '.customer-row', function() {
            if ($('#filter-customers').prop('disabled')) {
                return; // Do nothing when user edits a customer record.
            }
            
            $('#filter-results .selected-row').removeClass('selected-row');
            $(this).addClass('selected-row');
            
            var customerId = $(this).attr('data-id');
            var customer;
            
            $.each(BackendCustomers.filterResults, function(index, item) {
                if (item.id === customerId) {
                    customer = item;
                    return;
                }
            });
            
            BackendCustomers.selectedCustomer = customer;
            BackendCustomers.displayCustomer(customer);
            $('#edit-customer, #delete-customer').prop('disabled', false);
        });
        
        /**
         * Event: Appointment Row "Click"
         * 
         * Display appointment data of the selected row.
         */
        $(document).on('click', '.appointment-row', function() {
            $('#customer-appointments .selected-row').removeClass('selected-row');
            $(this).addClass('selected-row');
            
            var appointmentId = $(this).attr('data-id');
            var appointment;
            
            $.each(BackendCustomers.selectedCustomer.appointments, function(index, item) {
                if (item.id === appointmentId) {
                    appointment = item;
                    return;
                }
            });
            
            BackendCustomers.selectedAppointment = appointment;
            BackendCustomers.displayAppointment(appointment);
        });
        
        /**
         * Event: Filter Customers Button "Click"
         * 
         * Filter customer rows with given string.
         */
        $('#filter-customers').click(function() {
            BackendCustomers.filterCustomers($('#filter-key').val());
        });
        
        /**
         * Event: Add Customer Button "Click"
         */
        $('#add-customer').click(function() {
            BackendCustomers.resetForm();
            $('#add-edit-delete-group').hide();
            $('#save-cancel-group').show();
            $('#details').find('input, textarea').prop('readonly', false);
            $('#filter-customers').prop('disabled', true);
            $('.selected-row').removeClass('selected-row');
            $('#filter-results').css('color', '#AAA');
        });
        
        /**
         * Event: Edit Customer Button "Click"
         */
        $('#edit-customer').click(function() {
            $('#details').find('input, textarea').prop('readonly', false);
            $('#add-edit-delete-group').hide();
            $('#save-cancel-group').show();
            $('#filter-customers').prop('disabled', true);
            $('#filter-results').css('color', '#AAA');
        });
        
        /**
         * Event: Cancel Customer Add/Edit Operation Button "Click"
         */
        $('#cancel-customer').click(function() {
            $('#details').find('input, textarea').prop('readonly', true);
            $('#save-cancel-group').hide();
            $('#add-edit-delete-group').show();
            $('#filter-customers').prop('disabled', false);
             $('#filter-results').css('color', '');
            // Reset the selected appointments data.
            $('#filter-results .selected-row').trigger('click');
        });
        
        /**
         * Event: Save Add/Edit Customer Operation "Click"
         */
        $('#save-customer').click(function() {
            $('#filter-results').css('color', '');
            
            var customer = {
                'first_name': $('#first-name').val(),
                'last_name': $('#last-name').val(),
                'email': $('#email').val(),
                'phone_number': $('#phone-number').val(),
                'address': $('#address').val(),
                'city': $('#city').val(),
                'zip_code': $('#zip-code').val(),
                'notes': $('#notes').val()
            };
            
            if ($('#customer-id').val() != '') {
                customer.id = $('#customer-id').val();
            }
            
            BackendCustomers.saveCustomer(customer);
        });
        
        /**
         * Event: Delete Customer Button "Click"
         */
        $('#delete-customer').click(function() {
            var messageBtns = {
                'Delete': function() {
                    var customerId = BackendCustomers.selectedCustomer.id;
                    BackendCustomers.deleteCustomer(customerId);
                },
                        
                'Cancel': function() {
                    $('#message_box').dialog('close');
                }
            };
            
            GeneralFunctions.displayMessageBox('Delete Customer', 'Are you sure that you want '
                    + 'to delete this customer? This action cannot be undone.', messageBtns);
        });
	},
	
	/**
	 * This method displays the customer data on the right part of the page. 
	 * When a customer is selected the user can make changes and update the 
	 * customer record.
	 * 
	 * @param {int} customerId Selected customer's record id.
	 */
	displayCustomer: function(customer) {
        if (customer === undefined) {
            throw 'DisplayCustomer: customer is undefined';
        }
        
        BackendCustomers.resetForm();
        
        $('#customer-id').val(customer.id);
        $('#first-name').val(customer.first_name);
        $('#last-name').val(customer.last_name);
        $('#email').val(customer.email);
        $('#phone-number').val(customer.phone_number);
        $('#address').val(customer.address);
        $('#city').val(customer.city);
        $('#zip-code').val(customer.zip_code);
        $('#notes').val(customer.notes);
        
        $.each(customer.appointments, function(index, appointment) {
            var start = Date.parse(appointment.start_datetime).toString('dd/MM/yyyy HH:mm');
            var end = Date.parse(appointment.end_datetime).toString('dd/MM/yyyy HH:mm');
            var html = 
                    '<div class="appointment-row" data-id="' + appointment.id + '">' + 
                        start + ' - ' + end + '<br>' +
                        appointment.service.name + ', ' + 
                        appointment.provider.first_name + ' ' + appointment.provider.last_name +
                    '</div>';   
            $('#customer-appointments').append(html);
        });
	},
	
	/**
	 * This method makes an ajax call to the server and save the changes of 
	 * an existing customer record, or inserts a new customer row when on insert 
	 * mode.
	 * 
	 * NOTICE: User the "deleteCustomer" method to delete a customer record.
	 * 
	 * @param {object} customer Contains the customer data. If "id" is not 
	 * provided then the record is going to be inserted.
	 */
	saveCustomer: function(customer) {
        if (!BackendCustomers.validateForm()) return;
        
        var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_save_customer';
        var postData = { 'customer': JSON.stringify(customer) };
        
        $.post(postUrl, postData, function(response) {
            if (response.exceptions) {
				response.exceptions = GeneralFunctions.parseExceptions(response.exceptions);
				GeneralFunctions.displayMessageBox(Backend.EXCEPTIONS_TITLE, Backend.EXCEPTIONS_MESSAGE);
				$('#message_box').append(GeneralFunctions.exceptionsToHtml(response.exceptions));
				return;
			}
			
			if (response.warnings) {
				response.warnings = GeneralFunctions.parseExceptions(response.warnings);
				GeneralFunctions.displayMessageBox(Backend.WARNINGS_TITLE, Backend.WARNINGS_MESSAGE);
				$('#message_box').append(GeneralFunctions.exceptionsToHtml(response.warnings));
			}
            
            $('#add-edit-delete-group').show();
            $('#save-cancel-group').hide();
            $('#filter-customers').prop('disabled', false);
            $('#details').find('input, textarea').prop('readonly', true);
            
            BackendCustomers.filterCustomers($('#filter-key').val());
            
            // On edit mode keep the customer data on form.
            if (customer.id) { 
                $.each(BackendCustomers.filterResults, function(index, item) {
                    if (item.id == customer.id) {
                        customer.appointments = item.appointments; // w/ appointments
                        return;
                    }
                });
                BackendCustomers.displayCustomer(customer);
                $('#edit-customer, #delete-customer').prop('disabled', false);
            }
        }, 'json');
	},
	
	/**
	 * This method makes an ajax call to the server and deletes the selected
	 * customer record.
	 * 
	 * @param {int} customerId The customer record id to be deleted.
	 */
	deleteCustomer: function(customerId) {
		var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_delete_customer';
        var postData = { 'customer_id': BackendCustomers.selectedCustomer.id };

        $.post(postUrl, postData, function(response) {
            if (response.exceptions) {
                response.exceptions = GeneralFunctions.parseExceptions(response.exceptions);
                GeneralFunctions.displayMessageBox('Unexpected Issues', 'Unfortunately the '
                        + 'filter operation could not complete successfully. The following '
                        + 'issues occured.');
                $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.exceptions));
                return;
            }

            if (response.warnings) {
                response.warnings = GeneralFunctions.parseExceptions(response.warnings);
                GeneralFunctions.displayMessageBox('Unexpected Warnings', 'The filter operation '
                        + 'complete with the following warnings.');
                $('#message_box').append(GeneralFunctions.exceptionsToHtml(response.warnings));
            }

            $('#message_box').dialog('close');
            BackendCustomers.filterCustomers($('#filter-key').val());
        }, 'json');
	},
	
	/**
	 * This method filters the system registered customers. Pass an empty string
	 * to display all customers.
	 * 
	 * @param {string} key The filter key string.
	 */
	filterCustomers: function(key) {
		$('#filter-results').html('');
        BackendCustomers.resetForm();
        
        var postUrl = GlobalVariables.baseUrl + 'backend_api/ajax_filter_customers';
		var postData = { 'key': key };
		
        $.post(postUrl, postData, function(response) {
			if (response.exceptions) {
				response.exceptions = GeneralFunctions.parseExceptions(response.exceptions);
				GeneralFunctions.displayMessageBox('Unexpected Issues', 'Unfortunately the '
						+ 'filter operation could not complete successfully. The following '
						+ 'issues occured.');
				$('#message_box').append(GeneralFunctions.exceptionsToHtml(response.exceptions));
				return;
			}
			
			if (response.warnings) {
				response.warnings = GeneralFunctions.parseExceptions(response.warnings);
				GeneralFunctions.displayMessageBox('Unexpected Warnings', 'The filter operation '
						+ 'complete with the following warnings.');
				$('#message_box').append(GeneralFunctions.exceptionsToHtml(response.warnings));
			}
            
            BackendCustomers.filterResults = response;
			
			$.each(response, function(index, customer) {
				var html = 
					'<div class="customer-row" data-id="' + customer.id + '">' +
						'<strong>' + 
							customer.first_name + ' ' + customer.last_name + 
						'</strong><br>' + 
						'<span>' + customer.email + '</span> | ' + 
						'<span>' + customer.phone_number + '</span>' + 
					'</div><hr>';
				$('#filter-results').append(html);
			});
		}, 'json');
	},
	
	/**
	 * This method validates the main customer form of the page. There are certain 
	 * rules that the record must fullfil before getting into the system database.
	 * 
	 * @return {bool} Returns the validation result.
	 */
	validateForm: function() {
		try {
            $('#form-message').hide();
            $('.required').css('border', '');
            
            // :: CHECK REQUIRED FIELDS
            var missingRequiredField = false;
            $('.required').each(function() {
                if ($(this).val() == '') {
                    $(this).css('border', '2px solid red');
                    missingRequiredField = true;
                }
            });
            if (missingRequiredField) {
                throw 'Fields with * are required!';
            }
            
            // :: CHECK EMAIL ADDRESS
            if (!GeneralFunctions.validateEmail($('#email').val())) {
                $('#email').css('border', '2px solid red');
                throw 'Invalid email address!';
            }
            
            return true;
            
        } catch(exc) {
            $('#form-message').text(exc).show();
            return false;
        }
	},
            
    /**
     * Bring the customer data form back to its initial state.
     */
    resetForm: function() {
        $('#details').find('input, textarea').val(''); 
        $('#customer-appointments').html('');
        $('#appointment-details').html('');
        $('#edit-customer, #delete-customer').prop('disabled', true);
    },

    /**
     * Display appointment details on customers backend page.
     * 
     * @param {object} appointment Appointment data
     */
    displayAppointment: function(appointment) {
        var start = Date.parse(appointment.start_datetime).toString('dd/MM/yyyy HH:mm');
        var end = Date.parse(appointment.end_datetime).toString('dd/MM/yyyy HH:mm');
        
        var html = 
                '<div>' + 
                    '<strong>' + appointment.service.name + '</strong><br>' + 
                    appointment.provider.first_name + ' ' + appointment.provider.last_name + '<br>' +
                    start + ' - ' + end + '<br>' +
                '</div>';
        
        $('#appointment-details').html(html);
    }
};