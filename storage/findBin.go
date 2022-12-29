package storage

import (
	"encoding/json"
	"errors"
	"requestbin/types"
	"strings"

	bolt "go.etcd.io/bbolt"
)

func (s *Storage) FindBin(binName string) (*types.Bin, error) {
	var result []byte

	if strings.HasPrefix(binName, "static") {
		return nil, errors.New("not a bin")
	}

	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("bins"))
		v := b.Get([]byte(binName))

		if v != nil {
			result = make([]byte, len(v))
			result = v
		} else {
			result = nil
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	bin := &types.Bin{}
	err = json.Unmarshal(result, bin)

	if err != nil {
		return nil, err
	}

	return bin, nil
}
