package superadmin

import (
	"log"
	"net/http"
	"strings"

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

// validateSubscriptionPlan checks for basic validity of SubscriptionPlan fields
func validateSubscriptionPlan(plan *public.SubscriptionPlan) error {
	if strings.TrimSpace(plan.Name) == "" {
		return utils.NewValidationError("Name is required")
	}
	if plan.Price < 0 {
		return utils.NewValidationError("Price must be non-negative")
	}
	if plan.MaxCustomers < 0 {
		return utils.NewValidationError("Max customers must be non-negative")
	}
	if plan.MaxStaff < 0 {
		return utils.NewValidationError("Max staff must be non-negative")
	}
	if plan.MaxBandwidthMbps < 0 {
		return utils.NewValidationError("Max bandwidth must be non-negative")
	}
	return nil
}

func (h *PlanHandler) List(c *gin.Context) {
	plans, err := h.svc.ListPlans()
	if err != nil {
		log.Printf("ListPlans error: %v", err)
		utils.Error(c, http.StatusInternalServerError, "Failed to list plans", nil)
		return
	}
	utils.Success(c, "Plans listed", plans)
}

func (h *PlanHandler) Create(c *gin.Context) {
	var data public.SubscriptionPlan
	if err := c.ShouldBindJSON(&data); err != nil {
		log.Printf("CreatePlan bind error: %v", err)
		utils.Error(c, http.StatusBadRequest, "Invalid request", nil)
		return
	}

	if err := validateSubscriptionPlan(&data); err != nil {
		log.Printf("CreatePlan validation error: %v", err)
		utils.Error(c, http.StatusBadRequest, "Invalid plan data", err.Error())
		return
	}

	plan, err := h.svc.CreatePlan(data)
	if err != nil {
		log.Printf("CreatePlan error: %v", err)
		utils.Error(c, http.StatusInternalServerError, "Failed to create plan", nil)
		return
	}
	utils.Success(c, "Plan created", plan)
}

func (h *PlanHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var data public.SubscriptionPlan
	if err := c.ShouldBindJSON(&data); err != nil {
		log.Printf("UpdatePlan bind error: %v", err)
		utils.Error(c, http.StatusBadRequest, "Invalid request", nil)
		return
	}

	if err := validateSubscriptionPlan(&data); err != nil {
		log.Printf("UpdatePlan validation error: %v", err)
		utils.Error(c, http.StatusBadRequest, "Invalid plan data", err.Error())
		return
	}

	plan, err := h.svc.UpdatePlan(id, data)
	if err != nil {
		log.Printf("UpdatePlan error: %v", err)
		utils.Error(c, http.StatusInternalServerError, "Failed to update plan", nil)
		return
	}
	utils.Success(c, "Plan updated", plan)
}

func (h *PlanHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeletePlan(id); err != nil {
		log.Printf("DeletePlan error: %v", err)
		utils.Error(c, http.StatusInternalServerError, "Failed to delete plan", nil)
		return
	}
	utils.Success(c, "Plan deleted", nil)
}
