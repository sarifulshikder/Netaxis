package superadmin

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/public"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type PlanHandler struct {
	svc *services.TenantService
}

func NewPlanHandler(svc *services.TenantService) *PlanHandler {
	return &PlanHandler{svc: svc}
}

func (h *PlanHandler) List(c *gin.Context) {
	plans, err := h.svc.ListPlans()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list plans", err.Error())
		return
	}
	utils.Success(c, "Plans listed", plans)
}

func (h *PlanHandler) Create(c *gin.Context) {
	var data public.SubscriptionPlan
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	plan, err := h.svc.CreatePlan(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create plan", err.Error())
		return
	}
	utils.Success(c, "Plan created", plan)
}

func (h *PlanHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var data public.SubscriptionPlan
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	plan, err := h.svc.UpdatePlan(id, data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to update plan", err.Error())
		return
	}
	utils.Success(c, "Plan updated", plan)
}

func (h *PlanHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeletePlan(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to delete plan", err.Error())
		return
	}
	utils.Success(c, "Plan deleted", nil)
}
