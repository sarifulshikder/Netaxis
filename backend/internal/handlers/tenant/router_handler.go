package tenant

import (
	"fmt"
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

	limit := 50
	page := 1
	if l := c.Query("limit"); l != "" {
		fmt.Sscanf(l, "%d", &limit)
	}
	if p := c.Query("page"); p != "" {
		fmt.Sscanf(p, "%d", &page)
	}
	offset := (page - 1) * limit

	var total int64
	db.Model(&tenant.Router{}).Count(&total)
	result := db.Limit(limit).Offset(offset).Find(&routers)
	if result.Error != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list routers", "Database error")
		return
	}
	utils.Success(c, "Routers listed", map[string]interface{}{
		"routers": routers,
		"total":   total,
		"page":    page,
		"limit":   limit,
	})
}

func (h *RouterHandler) Create(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	var data tenant.Router
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	// Basic validation
	if data.Name == "" || data.Host == "" || data.Username == "" || data.Password == "" {
		utils.Error(c, http.StatusBadRequest, "Missing required fields", "Name, Host, Username, Password are required")
		return
	}
	result := db.Create(&data)
	if result.Error != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create router", "Database error")
		return
	}
	utils.Success(c, "Router created", data)
}

func (h *RouterHandler) Get(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")
	var router tenant.Router
	result := db.First(&router, "id = ?", id)
	if result.Error != nil {
		utils.Error(c, http.StatusNotFound, "Router not found", "No router with given ID")
		return
	}
	utils.Success(c, "Router fetched", router)
}

func (h *RouterHandler) Update(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")
	var router tenant.Router
	result := db.First(&router, "id = ?", id)
	if result.Error != nil {
		utils.Error(c, http.StatusNotFound, "Router not found", "No router with given ID")
		return
	}
	var data tenant.Router
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	// Only update allowed fields
	router.Name = data.Name
	router.Host = data.Host
	router.Port = data.Port
	router.Username = data.Username
	router.Password = data.Password
	router.Model = data.Model
	router.ZoneID = data.ZoneID
	router.Status = data.Status

	saveResult := db.Save(&router)
	if saveResult.Error != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to update router", "Database error")
		return
	}
	utils.Success(c, "Router updated", router)
}

func (h *RouterHandler) Delete(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")
	var router tenant.Router
	result := db.First(&router, "id = ?", id)
	if result.Error != nil {
		utils.Error(c, http.StatusNotFound, "Router not found", "No router with given ID")
		return
	}
	delResult := db.Delete(&router)
	if delResult.Error != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to delete router", "Database error")
		return
	}
	utils.Success(c, "Router deleted", nil)
}

func (h *RouterHandler) Test(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")
	var router tenant.Router
	result := db.First(&router, "id = ?", id)
	if result.Error != nil {
		utils.Error(c, http.StatusNotFound, "Router not found", "No router with given ID")
		return
	}
	if err := h.svc.TestConnection(router); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Connection test failed", "Unable to connect to router")
		return
	}
	utils.Success(c, "Connection test successful", nil)
}

func (h *RouterHandler) Resources(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")
	var router tenant.Router
	result := db.First(&router, "id = ?", id)
	if result.Error != nil {
		utils.Error(c, http.StatusNotFound, "Router not found", "No router with given ID")
		return
	}
	res, err := h.svc.GetRouterResources(router)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to fetch resources", "Unable to fetch router resources")
		return
	}
	utils.Success(c, "Router resources fetched", res)
}

func (h *RouterHandler) ActiveSessions(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")
	var router tenant.Router
	result := db.First(&router, "id = ?", id)
	if result.Error != nil {
		utils.Error(c, http.StatusNotFound, "Router not found", "No router with given ID")
		return
	}
	res, err := h.svc.GetActiveSessions(router)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to fetch sessions", "Unable to fetch active sessions")
		return
	}
	utils.Success(c, "Active sessions fetched", res)
}

func (h *RouterHandler) Sync(c *gin.Context) {
	// TODO: Implement actual sync logic, currently just a stub.
	utils.Success(c, "Router sync started", nil)
}
