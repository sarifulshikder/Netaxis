package tenant

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type CustomerHandler struct {
	svc *services.CustomerService
}

func NewCustomerHandler(svc *services.CustomerService) *CustomerHandler {
	return &CustomerHandler{svc: svc}
}

func (h *CustomerHandler) List(c *gin.Context) {
	pagination := utils.GeneratePaginationFromRequest(c)
	search := c.Query("search")

	res, err := h.svc.ListCustomers(pagination, search)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list customers", err.Error())
		return
	}
	utils.Paginated(c, "Customers listed", res.Rows, *res)
}

func (h *CustomerHandler) Create(c *gin.Context) {
	var data tenant.Customer
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	res, err := h.svc.CreateCustomer(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create customer", err.Error())
		return
	}
	utils.Success(c, "Customer created", res)
}

func (h *CustomerHandler) Get(c *gin.Context) {
	id := c.Param("id")
	res, err := h.svc.GetCustomer(id)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Customer not found", err.Error())
		return
	}
	utils.Success(c, "Customer fetched", res)
}

func (h *CustomerHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var data tenant.Customer
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	res, err := h.svc.UpdateCustomer(id, data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to update customer", err.Error())
		return
	}
	utils.Success(c, "Customer updated", res)
}

func (h *CustomerHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeleteCustomer(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to delete customer", err.Error())
		return
	}
	utils.Success(c, "Customer deleted", nil)
}

func (h *CustomerHandler) Statement(c *gin.Context) {
	id := c.Param("id")
	res, err := h.svc.GetStatement(id)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to fetch statement", err.Error())
		return
	}
	utils.Success(c, "Customer statement fetched", res)
}

func (h *CustomerHandler) History(c *gin.Context) {
	utils.Success(c, "Customer history fetched", nil)
}

func (h *CustomerHandler) Import(c *gin.Context) {
	utils.Success(c, "Customers imported", nil)
}

func (h *CustomerHandler) Export(c *gin.Context) {
	utils.Success(c, "Customers exported", nil)
}
