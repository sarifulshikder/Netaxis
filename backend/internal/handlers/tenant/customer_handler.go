package tenant

import (
	"context"
	"log"
	"net/http"
	"regexp"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

// CustomerHandler handles customer-related endpoints.
type CustomerHandler struct {
	svc *services.CustomerService
}

// NewCustomerHandler returns a new CustomerHandler.
func NewCustomerHandler(svc *services.CustomerService) *CustomerHandler {
	return &CustomerHandler{svc: svc}
}

// List returns a paginated list of customers.
func (h *CustomerHandler) List(c *gin.Context) {
	pagination := utils.GeneratePaginationFromRequest(c)
	search := c.Query("search")

	// Check for context cancellation (performance/safety)
	if c.Request.Context().Err() == context.Canceled {
		utils.Error(c, http.StatusRequestTimeout, "Request cancelled", nil)
		return
	}

	res, err := h.svc.ListCustomers(pagination, search)
	if err != nil {
		log.Printf("ListCustomers error: %v", err)
		utils.Error(c, http.StatusInternalServerError, "Failed to list customers", err.Error())
		return
	}
	utils.Paginated(c, "Customers listed", res.Rows, *res)
}

// validateCustomerInput performs basic validation on customer input.
func validateCustomerInput(data *tenant.Customer) error {
	// Validate email if present
	if data.Email != "" {
		emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
		if !emailRegex.MatchString(data.Email) {
			return utils.NewValidationError("Invalid email format")
		}
	}
	// Validate phone (basic, can be improved)
	if data.Phone == "" {
		return utils.NewValidationError("Phone is required")
	}
	// Validate name
	if data.Name == "" {
		return utils.NewValidationError("Name is required")
	}
	return nil
}

// Create creates a new customer with validated input and explicit field assignment.
func (h *CustomerHandler) Create(c *gin.Context) {
	var input tenant.Customer
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	if err := validateCustomerInput(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, "Validation error", err.Error())
		return
	}

	// Only assign allowed fields to prevent mass assignment
	data := tenant.Customer{
		Name:         input.Name,
		Phone:        input.Phone,
		Email:        input.Email,
		Address:      input.Address,
		Area:         input.Area,
		ZoneID:       input.ZoneID,
		NID:          input.NID,
	}

	res, err := h.svc.CreateCustomer(data)
	if err != nil {
		log.Printf("CreateCustomer error: %v", err)
		utils.Error(c, http.StatusInternalServerError, "Failed to create customer", err.Error())
		return
	}
	utils.Success(c, "Customer created", res)
}

// Get fetches a customer by ID.
func (h *CustomerHandler) Get(c *gin.Context) {
	id := c.Param("id")
	res, err := h.svc.GetCustomer(id)
	if err != nil {
		log.Printf("GetCustomer error: %v", err)
		utils.Error(c, http.StatusNotFound, "Customer not found", err.Error())
		return
	}
	utils.Success(c, "Customer fetched", res)
}

// Update updates a customer with validated input and explicit field assignment.
func (h *CustomerHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var input tenant.Customer
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	if err := validateCustomerInput(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, "Validation error", err.Error())
		return
	}

	// Only update allowed fields
	updateData := map[string]interface{}{
		"name":    input.Name,
		"phone":   input.Phone,
		"email":   input.Email,
		"address": input.Address,
		"area":    input.Area,
		"zone_id": input.ZoneID,
		"nid":     input.NID,
	}

	res, err := h.svc.UpdateCustomer(id, updateData)
	if err != nil {
		log.Printf("UpdateCustomer error: %v", err)
		utils.Error(c, http.StatusInternalServerError, "Failed to update customer", err.Error())
		return
	}
	utils.Success(c, "Customer updated", res)
}

// Delete deletes a customer by ID.
func (h *CustomerHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeleteCustomer(id); err != nil {
		log.Printf("DeleteCustomer error: %v", err)
		utils.Error(c, http.StatusInternalServerError, "Failed to delete customer", err.Error())
		return
	}
	utils.Success(c, "Customer deleted", nil)
}

// Statement returns a customer's statement.
func (h *CustomerHandler) Statement(c *gin.Context) {
	id := c.Param("id")
	res, err := h.svc.GetStatement(id)
	if err != nil {
		log.Printf("GetStatement error: %v", err)
		utils.Error(c, http.StatusInternalServerError, "Failed to fetch statement", err.Error())
		return
	}
	utils.Success(c, "Customer statement fetched", res)
}

// History returns a customer's history (stub).
func (h *CustomerHandler) History(c *gin.Context) {
	utils.Success(c, "Customer history fetched", nil)
}

// Import imports customers (stub).
func (h *CustomerHandler) Import(c *gin.Context) {
	utils.Success(c, "Customers imported", nil)
}

// Export exports customers (stub).
func (h *CustomerHandler) Export(c *gin.Context) {
	utils.Success(c, "Customers exported", nil)
}
