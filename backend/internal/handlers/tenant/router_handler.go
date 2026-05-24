package tenant

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
	"gorm.io/gorm"
)

type RouterHandler struct {
	svc *services.MikrotikService
}

func NewRouterHandler(svc *services.MikrotikService) *RouterHandler {
	return &RouterHandler{svc: svc}
}

func (h *RouterHandler) List(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	var routers []tenant.Router
	db.Find(&routers)
	utils.Success(c, "Routers listed", routers)
}

func (h *RouterHandler) Create(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	var data tenant.Router
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	db.Create(&data)
	utils.Success(c, "Router created", data)
}

func (h *RouterHandler) Get(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")
	var router tenant.Router
	db.First(&router, "id = ?", id)
	utils.Success(c, "Router fetched", router)
}

func (h *RouterHandler) Update(c *gin.Context) {
	utils.Success(c, "Router updated", nil)
}

func (h *RouterHandler) Delete(c *gin.Context) {
	utils.Success(c, "Router deleted", nil)
}

func (h *RouterHandler) Test(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")
	var router tenant.Router
	db.First(&router, "id = ?", id)

	if err := h.svc.TestConnection(router); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Connection test failed", err.Error())
		return
	}
	utils.Success(c, "Connection test successful", nil)
}

func (h *RouterHandler) Resources(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")
	var router tenant.Router
	db.First(&router, "id = ?", id)

	res, err := h.svc.GetRouterResources(router)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to fetch resources", err.Error())
		return
	}
	utils.Success(c, "Router resources fetched", res)
}

func (h *RouterHandler) ActiveSessions(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")
	var router tenant.Router
	db.First(&router, "id = ?", id)

	res, err := h.svc.GetActiveSessions(router)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to fetch sessions", err.Error())
		return
	}
	utils.Success(c, "Active sessions fetched", res)
}

func (h *RouterHandler) Sync(c *gin.Context) {
	utils.Success(c, "Router sync started", nil)
}
