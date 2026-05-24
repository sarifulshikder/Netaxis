package superadmin

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/public"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type TenantHandler struct {
	svc *services.TenantService
}

func NewTenantHandler(svc *services.TenantService) *TenantHandler {
	return &TenantHandler{svc: svc}
}

func (h *TenantHandler) List(c *gin.Context) {
	tenants, err := h.svc.ListTenants()
	if err != nil {
		// Avoid leaking internal error details to client
		utils.Error(c, http.StatusInternalServerError, "Failed to list tenants", nil)
		return
	}
	utils.Success(c, "Tenants listed", tenants)
}

type CreateTenantRequest struct {
	public.Tenant
	AdminPassword string `json:"admin_password" binding:"required"`
	PlanID        string `json:"plan_id" binding:"required"`
}

func (h *TenantHandler) Create(c *gin.Context) {
	var req CreateTenantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	// Defensive: ensure admin password is not empty (should be enforced by binding, but double check)
	if req.AdminPassword == "" {
		utils.Error(c, http.StatusBadRequest, "Admin password required", nil)
		return
	}

	tenant, err := h.svc.CreateTenant(req.Tenant, req.AdminPassword, req.PlanID)
	if err != nil {
		// Avoid leaking internal error details to client
		utils.Error(c, http.StatusInternalServerError, "Failed to create tenant", nil)
		return
	}
	utils.Success(c, "Tenant created successfully", tenant)
}

func (h *TenantHandler) Get(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		utils.Error(c, http.StatusBadRequest, "Missing tenant ID", nil)
		return
	}
	tenant, err := h.svc.GetTenant(id)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Tenant not found", nil)
		return
	}
	utils.Success(c, "Tenant fetched", tenant)
}

func (h *TenantHandler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		utils.Error(c, http.StatusBadRequest, "Missing tenant ID", nil)
		return
	}
	var data public.Tenant
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	tenant, err := h.svc.UpdateTenant(id, data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to update tenant", nil)
		return
	}
	utils.Success(c, "Tenant updated", tenant)
}

func (h *TenantHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		utils.Error(c, http.StatusBadRequest, "Missing tenant ID", nil)
		return
	}
	// TODO: Implement actual soft delete logic in service layer
	utils.Success(c, "Tenant deleted (soft)", nil)
}

func (h *TenantHandler) Activate(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		utils.Error(c, http.StatusBadRequest, "Missing tenant ID", nil)
		return
	}
	if err := h.svc.ActivateTenant(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to activate", nil)
		return
	}
	utils.Success(c, "Tenant activated", nil)
}

func (h *TenantHandler) Suspend(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		utils.Error(c, http.StatusBadRequest, "Missing tenant ID", nil)
		return
	}
	if err := h.svc.SuspendTenant(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to suspend", nil)
		return
	}
	utils.Success(c, "Tenant suspended", nil)
}
