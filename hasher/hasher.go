package hasher

import (
	"errors"

	"github.com/speps/go-hashids"
)

type Hasher struct {
	hd *hashids.HashID
}

func NewHasher(salt string) *Hasher {
	hd, _ := createIdHasher(salt)
	return &Hasher{
		hd,
	}
}

func createIdHasher(salt string) (*hashids.HashID, error) {
	hd := hashids.NewData()
	hd.Salt = salt
	hd.MinLength = 5
	return hashids.NewWithData(hd)
}

func (h *Hasher) HashId(v int) string {
	id, _ := h.hd.Encode([]int{v})
	return id
}

func (h *Hasher) DecodeHashId(hash string) (int, error) {
	d, err := h.hd.DecodeWithError(hash)
	if err != nil {
		return -1, err
	}
	if len(d) != 0 {
		return d[0], err
	}

	return -1, errors.New("hash not decoded")
}
