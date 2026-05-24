package utils

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

type Pagination struct {
	Limit      int         `json:"limit"`
	Page       int         `json:"page"`
	Sort       string      `json:"sort"`
	TotalRows  int64       `json:"total_rows"`
	TotalPages int         `json:"total_pages"`
	Rows       interface{} `json:"rows"`
}

func GeneratePaginationFromRequest(c *gin.Context) Pagination {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	sort := c.DefaultQuery("sort", "created_at desc")

	if limit <= 0 {
		limit = 10
	}
	if page <= 0 {
		page = 1
	}

	return Pagination{
		Limit: limit,
		Page:  page,
		Sort:  sort,
	}
}

func (p *Pagination) GetOffset() int {
	return (p.Page - 1) * p.Limit
}

func (p *Pagination) GetLimit() int {
	return p.Limit
}

func (p *Pagination) GetSort() string {
	return p.Sort
}
