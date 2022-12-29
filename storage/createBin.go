package storage

import (
	"encoding/json"
	"requestbin/types"

	bolt "go.etcd.io/bbolt"
)

func (s *Storage) CreateBinWithName(name string) (*types.Bin, error) {
	return s.createBin(&name)
}

func (s *Storage) CreateBin() (*types.Bin, error) {
	return s.createBin(nil)
}

func (s *Storage) createBin(name *string) (*types.Bin, error) {
	bin := &types.Bin{}

	err := s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("bins"))

		id, _ := b.NextSequence()

		var binId string
		if name == nil {
			binId = s.hasher.HashId(int(id))
		} else {
			binId = *name
		}

		bin.ID = binId

		buf, err := json.Marshal(bin)
		if err != nil {
			return err
		}

		return b.Put([]byte(binId), buf)
	})

	return bin, err
}
